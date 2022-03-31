import json

from DynamicGraph.server.addSpeed import addSpeed
from DynamicGraph.server.readData import readDefaultNetworks, readGamePositionData
from DynamicGraph.server.generateGraph import generateNetworks


def getStatisticData():
    """
    得到 对阵 关系 等视图
    :return:
    """
    result = 'statistic data'

    return result


# 得到网络数据
def getGameNetwork(gameID, disThreshold, kThreshold):
    result = 'game network'
    gameGraphData = None
    if disThreshold == 1.0 and kThreshold == 1:
        # 默认 读取已经计算好 的 网络 数据
        gameGraphData = readDefaultNetworks(gameID)  # 比赛 整场 网络 数据
    else:
        # 读取 位置数据 重新 计算 网络数据
        gamePositionData = readGamePositionData(gameID)  # 比赛 正常 位置 数据
        gameGraphData = generateNetworks(gamePositionData, disThreshold=disThreshold, kThreshold=kThreshold)  # 计算 网络 数据

    # 计算速度
    gameGraphData = addSpeed(gameGraphData)

    # 得到 比赛的网络数据之后 合并每一个时间段的数据 到 一 整个网络上
    # gameGraphMergedData = mergeGameNetwork(gameGraphData)  # 合并 网络 到 整个比赛的层级上
    gameGraphMergedData = mergeGameNetworkV2(gameGraphData)  # 合并 网络 到 整个比赛的层级上

    gameGraphData['data'] = gameGraphMergedData  # 保存 这个 数据

    result = gameGraphData
    return result

# 合并网络数据
def mergeGameNetworkV2(gameNetworkData):
    """
        合并网络
        :param gameNetworkData:
        :return:
        """
    result = 'merge game network'
    # linkKey = []  # 存储 graph 的 key 方便 判断
    playersMap = generatePlayersObj(gameNetworkData)
    nodes = {}  # 存储 nodes 的 连接
    linksMap = {}  # 存储 graph 的 连接
    gameGraphLinks = []  # 存储 图 链接 序列
    gameGraphNodes = []  # 存储 图 节点
    # 遍历数据
    networkData = gameNetworkData['data']  # 网络数据
    for quarterIndex, quarterData in enumerate(networkData):  # 遍历 比赛 到 小节 （0
        for roundIndex, roundData in enumerate(quarterData):  # 遍历 小节 到 回合
            for timestampsIndex, timestampsData in enumerate(roundData):  # 遍历 回合 到 时间点
                quarterLabel = timestampsData[1]  # 小节 标签
                quarterTime = timestampsData[3]  # 小节 时间
                roundTime = timestampsData[4]
                # 存储球员的时间信息
                playerList = timestampsData[5]  # 得到 该 时间点的 球员序列
                timePlayerMap = {}
                for p in playerList:
                    # 节点上场的时间格式，小节索引，小节时间，回合标签，回合时间，回合内的时间戳索引（表示第几个时间内）
                    nodeCourtTime = [quarterIndex + 1, quarterTime, roundIndex + 1, roundTime, timestampsIndex + 1,
                                     p[2], p[3], p[5], p[6], p[7]]
                    # 保存
                    playersMap[str(p[1])]['courtTime'].append(nodeCourtTime)
                    # 置办当前时刻的球员Map
                    timePlayerMap[str(p[1])] = p

                graphList = timestampsData[6]  # 得到 该 时间点的 图序列

                for graph in graphList:  # 遍历 图序列 到 每一个图
                    source = graph['s']  # 起点
                    target = graph['t']  # 终点
                    dis = graph['dis']  # 距离
                    # 存储节点信息
                    p1 = timePlayerMap[str(source)]
                    p2 = timePlayerMap[str(target)]
                    # 节点存储的链接信息，起点，终点，距离，小节索引，小节时间，回合标签，回合时间，回合内的时间戳索引
                    nodeLink = [source, target, dis, quarterIndex + 1, quarterTime, roundIndex + 1, roundTime,
                                timestampsIndex + 1, p1[2], p1[3], p1[5], p1[6], p1[7], p2[2], p2[3], p2[5], p2[6],
                                p2[7]]
                    # 保存球员的链接信息
                    playersMap[str(source)]['links'].append(nodeLink)
                    playersMap[str(target)]['links'].append(nodeLink)
                    # 存储连接信息
                    # 连接信息，距离，小节索引，小节时间，回合标签，回合时间，回合内的时间戳索引
                    linkData = [dis, quarterIndex + 1, quarterTime, roundIndex + 1, roundTime, timestampsIndex + 1,
                                p1[2], p1[3], p1[5], p1[6], p1[7], p2[2], p2[3], p2[5], p2[6],
                                p2[7]]
                    linkKey = str(source) + '_' + str(target)
                    if source > target:
                        linkKey = str(target) + '_' + str(source)
                    if linkKey not in linksMap:
                        linkObj = {'source': str(source), 'target': str(target), 'dis': [linkData]}
                        linksMap[linkKey] = linkObj
                    else:
                        linkObj = linksMap[linkKey]
                        linkObj['dis'].append(linkData)
                        linksMap[linkKey] = linkObj

    # 整理节点信息
    gameGraphNodes = [playersMap['-1']]
    pList = []
    for nodeID in playersMap.keys():
        if playersMap[nodeID]['teamDes'] == 'home':
            pList.append(playersMap[nodeID])
    pList = sorted(pList, key=lambda k: k['playerid'])
    gameGraphNodes += pList
    pList = []
    for nodeID in playersMap.keys():
        if playersMap[nodeID]['teamDes'] == 'visitor':
            pList.append(playersMap[nodeID])
    pList = sorted(pList, key=lambda k: k['playerid'])
    gameGraphNodes += pList
    # 整理链接信息
    for linkKey in linksMap.keys():
        gameGraphLinks.append(linksMap[linkKey])

    result = {'nodes': gameGraphNodes, 'links': gameGraphLinks}

    return result

# 产生运动员
def generatePlayersObj(gameData):
    """
    构建 运动员 的对象
    :param gameData: 比赛数据
    :return: 返回一个obj
    """
    result = {}
    p = {'lastname': '', 'firstname': '', 'playerid': -1, 'jersey': '', 'position': ''}
    p['id'] = '-1'  # 球员ID
    p['teamAbbr'] = ''  # 球队缩写
    p['teamID'] = -1  # 球队ID
    p['teamDes'] = 'ball'  # 球队描述
    p['links'] = []  # 连接
    p['courtTime'] = []  # 上场时间
    result['-1'] = p

    for p in gameData['homeTeam']['players']:
        id = p['playerid']
        p['id'] = str(id)  # 球员ID
        p['teamAbbr'] = gameData['homeTeam']['abbreviation']  # 球队缩写
        p['teamID'] = gameData['homeTeam']['teamid']  # 球队ID
        p['teamDes'] = 'home'  # 球队描述
        p['links'] = []  # 连接  # 存储链接的时间，起点，终点，距离，序号
        p['courtTime'] = []  # 上场时间
        result[str(id)] = p
    for p in gameData['visitorTeam']['players']:
        id = p['playerid']
        p['id'] = str(id)  # 球员ID
        p['teamAbbr'] = gameData['visitorTeam']['abbreviation']  # 球队缩写
        p['teamID'] = gameData['visitorTeam']['teamid']  # 球队ID
        p['teamDes'] = 'visitor'  # 球队描述
        p['links'] = []  # 连接  # 存储链接的时间，起点，终点，距离，序号
        p['courtTime'] = []  # 上场时间
        result[str(id)] = p
    return result  # 返回值


def mergeGameNetwork(gameNetworkData):
    """
    合并网络
    :param gameNetworkData:
    :return:
    """
    result = 'merge game network'
    linkKey = []  # 存储 graph 的 key 方便 判断
    linkMap = {}  # 存储 graph 的 obj 方便
    gameGraphLinks = []  # 存储 图 链接 序列
    gameGraphNodes = []  # 存储 图 节点
    # 遍历数据
    networkData = gameNetworkData['data']  # 网络数据
    for quarterData in networkData:  # 遍历 比赛 到 小节
        for roundData in quarterData:  # 遍历 小节 到 回合
            for timeData in roundData:  # 遍历 回合 到 时间点
                graphList = timeData[6]  # 得到 该 时间点的 图序列
                for graph in graphList:  # 遍历 图序列 到 每一个图
                    s = graph['s']  # 起点
                    t = graph['t']  # 终点
                    dis = graph['dis']  # 距离
                    key = str(s) + '_' + str(t)  # graph key
                    possibleKey = str(t) + '_' + str(s)  # graph 可能存在的 key
                    if key in linkKey:
                        link = linkMap[key]
                        link['disList'].append(dis)
                        linkMap[key] = link
                    elif possibleKey in linkKey:
                        link = linkMap[possibleKey]
                        link['disList'].append(dis)
                        linkMap[possibleKey] = link
                    else:
                        linkMap[key] = {'source': str(s), 'target': str(t), 'disList': [dis]}
                        linkKey.append(key)
                        linkMap[possibleKey] = {'source': str(s), 'target': str(t), 'disList': [dis]}
                        linkKey.append(possibleKey)
                # print(1)
    # 去掉 无效 的链接网络
    for key in linkMap.keys():  # 遍历 图中的 序列
        if key in linkKey:
            link = linkMap[key]  # 链接 数据
            s = link['source']
            t = link['target']
            # 保存 节点 nodes
            if s not in gameGraphNodes:
                gameGraphNodes.append(s)
            if t not in gameGraphNodes:
                gameGraphNodes.append(t)
            # 保存  链接 links
            possibleKey = link['target'] + '_' + link['source']  # 可能存在的 key 值
            possibleLink = linkMap[possibleKey]  # 得到和它对应的 一组 link 数据
            if len(link['disList']) >= len(possibleLink['disList']):  # if 判断 保存哪一个link 到 graph
                link['disNum'] = len(link['disList'])
                linkKey.remove(possibleKey)
                gameGraphLinks.append(link)
            else:
                possibleLink['disNum'] = len(possibleLink['disList'])
                linkKey.remove(key)
                gameGraphLinks.append(possibleLink)

    # 调整 节点信息 todo: 之后 会加上 姓名 球队信息等 信息

    for i, node in enumerate(gameGraphNodes):
        gameGraphNodes[i] = {'id': node}

    gameGraphNodes = addNodeInfo(json.loads(json.dumps(gameGraphNodes)), json.loads(json.dumps(gameNetworkData)),
                                 json.loads(json.dumps(gameGraphLinks)))

    result = {'nodes': gameGraphNodes, 'links': gameGraphLinks}

    return result


def addNodeInfo(nodesList, gameData, linksList):
    result = []
    homeTeam = gameData['homeTeam']
    visitorTeam = gameData['visitorTeam']
    homePlayers = homeTeam['players']
    visitorPlayers = visitorTeam['players']
    for node in nodesList:
        linkNum = 0
        for link in linksList:
            if link['source'] == node['id'] or link['target'] == node['id']:
                linkNum += link['disNum']
        nodeID = int(node['id'])
        if node['id'] == '-1':
            p = {'lastname': '', 'firstname': '', 'playerid': -1, 'jersey': '-1',
                 'position': '', 'linksNum': linkNum, 'id': node['id'], 'team': -1, 'teamAbbr': 'ball',
                 'teamInfo': 'ball'}
            result.append(p)
        else:
            for p in homePlayers:
                if p['playerid'] == nodeID:
                    p['id'] = node['id']
                    p['linksNum'] = linkNum
                    p['team'] = homeTeam['teamid']
                    p['teamAbbr'] = homeTeam['abbreviation']
                    p['teamInfo'] = 'home'
                    result.append(p)
                    break
            for p in visitorPlayers:
                if p['playerid'] == nodeID:
                    p['id'] = node['id']
                    p['linksNum'] = linkNum
                    p['team'] = visitorTeam['teamid']
                    p['teamAbbr'] = visitorTeam['abbreviation']
                    p['teamInfo'] = 'visitor'
                    result.append(p)
                    break
    # 按照自定义顺序进行 节点 排序
    nodesTmp = []
    for p in result:
        if p['id'] == '-1':
            nodesTmp.append(p)
    playersList = []
    for p in result:
        if p['teamInfo'] == 'home':
            playersList.append(p)
    homePlayersList = sorted(playersList, key=lambda k: k['linksNum'], reverse=True)
    # homePlayersList = sorted(playersList, key=lambda k: (k.__getitem__('position'), len(k.__getitem__('position'))), reverse=True)
    nodesTmp = nodesTmp + homePlayersList
    playersList = []
    for p in result:
        if p['teamInfo'] == 'visitor':
            playersList.append(p)
    homePlayersList = sorted(playersList, key=lambda k: k['linksNum'], reverse=True)
    # homePlayersList = sorted(playersList, key=lambda k: k['position'], reverse=True)
    nodesTmp = nodesTmp + homePlayersList

    result = nodesTmp
    return result


def mergeGameQuarterNetwork(gameNetworkData):
    result = 'merge game quarter network'

    return result


def mergeGameRoundNetwork(gameNetworkData):
    result = 'merge game round network'

    return result


if __name__ == '__main__':
    gameID = '0021500003'
    result = getGameNetwork(gameID, 1, 1)
    # result = getGameNetwork(gameID, 2.0, 1)
