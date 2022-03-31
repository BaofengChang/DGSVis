import math
import json
import os
import datetime


def getGameGraphs(gameID, disThreshold=1.0, kThreshold=1):
    """
    得到比赛数据
    :param gameID: 比赛ID
    :param disThreshold: 距离参数
    :param kThreshold: 近邻参数
    :return:
    """
    data = None
    data = readGameGraphFile(gameID=gameID)  # 读取 比赛图 数据
    # 得到 主队，客队 信息 和 整场的球员Map（包含 事件）
    homeTeam = data['homeTeam']
    visitorTeam = data['visitorTeam']
    gamePlayerMap = getGamePlayerMap(gameID=gameID, homeTeam=homeTeam, visitorTeam=visitorTeam)
    # 得到 时间 数据
    gameData = data['data']  # 得到 时间 数据
    linksMap = {}
    nodesMap = {}
    # 设置先发球员
    timePositionList = gameData[0][0][0][5]
    for playerPosition in timePositionList:  # 遍历这个时刻的球员
        playerID = str(playerPosition[1])
        playerObj = gamePlayerMap[playerID]
        playerObj['isSP'] = True

    allLinksMap = {}

    # 遍历 时间 数据
    for quarterIndex, quarterData in enumerate(gameData):
        for roundIndex, roundData in enumerate(quarterData):
            for timeIndex, timeData in enumerate(roundData):
                # 小节时间 和 回合时间
                quarterTime = timeData[3]
                roundTime = timeData[4]
                # 这个 时间的 位置信息 和 这个时间的球员 Map (key 是 球员id， value 是 位置信息 速度 方向等)
                timePositionList = timeData[5]
                timePlayerMap = getTimePlayerMap(timePositionList)

                # 保存球员的 时间信息
                for playerIndex, playerPosition in enumerate(timePositionList):  # 遍历这个时刻的球员
                    playerID = str(playerPosition[1])
                    # 如果 nodes map 里 没有这个球员
                    if playerID not in nodesMap:
                        playerObj = gamePlayerMap[playerID]
                        courtTime = playerObj['courttime']
                        courtTimeNum = playerObj['courttimenum']
                        # 构建时刻信息
                        # timeInfo = [quarterIndex, quarterTime, roundIndex, roundTime, timeIndex, playerIndex,
                        #             playerPosition[2], playerPosition[3], playerPosition[5], playerPosition[6],
                        #             playerPosition[7]]
                        # 只保留时间索引信息
                        timeInfo = [quarterIndex, roundIndex, timeIndex, playerIndex]
                        courtTime.append(timeInfo)
                        courtTimeNum += 1
                        playerObj['courttime'] = courtTime
                        playerObj['courttimenum'] = courtTimeNum
                        # 存储 节点信息
                        nodesMap[playerID] = playerObj
                    # 如果 nodes map 里 有这个球员
                    else:
                        playerObj = nodesMap[playerID]
                        courtTime = playerObj['courttime']
                        courtTimeNum = playerObj['courttimenum']
                        # 构建时刻信息
                        # timeInfo = [quarterIndex, quarterTime, roundIndex, roundTime, timeIndex,
                        #             playerPosition[2], playerPosition[3], playerPosition[5], playerPosition[6],
                        #             playerPosition[7]]
                        # 只保留时间索引信息
                        timeInfo = [quarterIndex, roundIndex, timeIndex, playerIndex]
                        courtTime.append(timeInfo)
                        courtTimeNum += 1
                        playerObj['courttime'] = courtTime
                        playerObj['courttimenum'] = courtTimeNum
                        # 存储 节点信息
                        nodesMap[playerID] = playerObj

                # 这个 时间 的链接
                timeLinks = timeData[6]
                ballLink = timeLinks[0]  # 球的链接
                sameTeamNearestLink = timeLinks[1][0]  # 同队链接
                differentTeamNearestLink = timeLinks[1][1]  # 异队链接
                distanceLink = timeLinks[2]  # 距离链接
                # 这个时间的 链接 的 key
                timeLinksKey = []
                # 球的链接
                for link in ballLink:  # 球的链接
                    # 起点 终点 距离 链接key
                    source = link[0]
                    target = link[1]
                    dis = link[2]
                    linkKey = str(source) + '-' + str(target)

                    # 起点 终点 信息
                    sourceInfo = timePlayerMap[str(source)]
                    targetInfo = timePlayerMap[str(target)]
                    # link 信息
                    linkInfo = [dis, quarterIndex, quarterTime, roundIndex, roundTime,
                                sourceInfo[2], sourceInfo[3], sourceInfo[5], sourceInfo[6], sourceInfo[7],
                                targetInfo[2], targetInfo[3], targetInfo[5], targetInfo[6], targetInfo[7]]

                    # 完整的link信息
                    completeLinkInfo = [source, target, dis, quarterIndex, quarterTime, roundIndex, roundTime,
                                        timeIndex,
                                        sourceInfo[2], sourceInfo[3], sourceInfo[5], sourceInfo[6], sourceInfo[7],
                                        targetInfo[2], targetInfo[3], targetInfo[5], targetInfo[6], targetInfo[7]]
                    completeLinkKey = str(quarterIndex) + '_' + str(roundIndex) + '_' + str(timeIndex) + '_' + str(
                        source) + '_' + str(target)
                    if completeLinkKey not in allLinksMap:
                        allLinksMap[completeLinkKey] = [len(allLinksMap), completeLinkInfo]

                    # 判断在这个时间，这个链接是不是已经有了，如果已经有了，那么直接进行下一步操作
                    if linkKey not in timeLinksKey:
                        timeLinksKey.append(linkKey)
                        # 保存链接信息
                        if linkKey not in linksMap:
                            # 起点 终点 【距离，小节下标，小节时间，回合索引，回合时间，起点x，起点y,起点z,起点speed,起点speedx,起点speedy,
                            # 终点x，终点y,终点z，终点speed,终点speedX,终点speedY】
                            linkObj = [source, target, [completeLinkKey]]
                            linksMap[linkKey] = linkObj
                        else:
                            linkObj = linksMap[linkKey]
                            disList = linkObj[2]
                            disList.append(completeLinkKey)
                            linkObj[2] = disList
                            linksMap[linkKey] = linkObj

                    # 保存连接到节点信息
                    anotherLinkInfo = [source, target] + linkInfo

                    # 起点
                    sourceNode = nodesMap[str(source)]  # 起点
                    sourceNodeLinks = sourceNode['links']
                    sourceNodeLinksNum = sourceNode['linksnum'] + 1
                    sourceNodeLinks[0].append(completeLinkKey)
                    sourceNode['links'] = sourceNodeLinks
                    sourceNode['linksnum'] = sourceNodeLinksNum
                    nodesMap[str(source)] = sourceNode
                    # 终点
                    targetNode = nodesMap[str(target)]  # 终点
                    targetNodeLinks = targetNode['links']
                    targetNodeLinksNum = targetNode['linksnum'] + 1
                    targetNodeLinks[0].append(completeLinkKey)
                    targetNode['links'] = targetNodeLinks
                    targetNode['linksnum'] = targetNodeLinksNum
                    nodesMap[str(target)] = targetNode

                # 同队的链接
                for link in sameTeamNearestLink:  # 球的链接
                    # 起点 终点 距离 链接key
                    source = link[0]
                    target = link[1]
                    dis = link[2]
                    linkKey = str(source) + '-' + str(target)

                    # 起点 终点 信息
                    sourceInfo = timePlayerMap[str(source)]
                    targetInfo = timePlayerMap[str(target)]
                    # link 信息
                    linkInfo = [dis, quarterIndex, quarterTime, roundIndex, roundTime,
                                sourceInfo[2], sourceInfo[3], sourceInfo[5], sourceInfo[6], sourceInfo[7],
                                targetInfo[2], targetInfo[3], targetInfo[5], targetInfo[6], targetInfo[7]]

                    # 完整的link信息
                    completeLinkInfo = [source, target, dis, quarterIndex, quarterTime, roundIndex, roundTime,
                                        timeIndex,
                                        sourceInfo[2], sourceInfo[3], sourceInfo[5], sourceInfo[6], sourceInfo[7],
                                        targetInfo[2], targetInfo[3], targetInfo[5], targetInfo[6], targetInfo[7]]
                    completeLinkKey = str(quarterIndex) + '_' + str(roundIndex) + '_' + str(timeIndex) + '_' + str(
                        source) + '_' + str(target)
                    if completeLinkKey not in allLinksMap:
                        allLinksMap[completeLinkKey] = [len(allLinksMap), completeLinkInfo]

                    # 判断在这个时间，这个链接是不是已经有了，如果已经有了，那么直接进行下一步操作
                    if linkKey not in timeLinksKey:
                        timeLinksKey.append(linkKey)
                        # 保存链接信息
                        if linkKey not in linksMap:
                            # 起点 终点 【距离，小节下标，小节时间，回合索引，回合时间，起点x，起点y,起点z,起点speed,起点speedx,起点speedy,
                            # 终点x，终点y,终点z，终点speed,终点speedX,终点speedY】
                            linkObj = [source, target, [completeLinkKey]]
                            linksMap[linkKey] = linkObj
                        else:
                            linkObj = linksMap[linkKey]
                            disList = linkObj[2]
                            disList.append(completeLinkKey)
                            linkObj[2] = disList
                            linksMap[linkKey] = linkObj

                    # 保存连接到节点信息
                    anotherLinkInfo = [source, target] + linkInfo
                    # 起点
                    sourceNode = nodesMap[str(source)]  # 起点
                    sourceNodeLinks = sourceNode['links']
                    sourceNodeLinksNum = sourceNode['linksnum'] + 1
                    sourceNodeLinks[1].append(completeLinkKey)
                    sourceNode['links'] = sourceNodeLinks
                    sourceNode['linksnum'] = sourceNodeLinksNum
                    nodesMap[str(source)] = sourceNode

                    # 终点
                    targetNode = nodesMap[str(target)]  # 终点
                    targetNodeLinks = targetNode['links']
                    targetNodeLinksNum = targetNode['linksnum'] + 1
                    targetNodeLinks[1].append(completeLinkKey)
                    targetNode['links'] = targetNodeLinks
                    targetNode['linksnum'] = targetNodeLinksNum
                    nodesMap[str(target)] = targetNode

                # 不同同队的链接
                for link in differentTeamNearestLink:  # 球的链接
                    # 起点 终点 距离 链接key
                    source = link[0]
                    target = link[1]
                    dis = link[2]
                    linkKey = str(source) + '-' + str(target)

                    # 起点 终点 信息
                    sourceInfo = timePlayerMap[str(source)]
                    targetInfo = timePlayerMap[str(target)]
                    # link 信息
                    linkInfo = [dis, quarterIndex, quarterTime, roundIndex, roundTime,
                                sourceInfo[2], sourceInfo[3], sourceInfo[5], sourceInfo[6], sourceInfo[7],
                                targetInfo[2], targetInfo[3], targetInfo[5], targetInfo[6], targetInfo[7]]

                    # 完整的link信息
                    completeLinkInfo = [source, target, dis, quarterIndex, quarterTime, roundIndex, roundTime,
                                        timeIndex,
                                        sourceInfo[2], sourceInfo[3], sourceInfo[5], sourceInfo[6], sourceInfo[7],
                                        targetInfo[2], targetInfo[3], targetInfo[5], targetInfo[6], targetInfo[7]]
                    completeLinkKey = str(quarterIndex) + '_' + str(roundIndex) + '_' + str(timeIndex) + '_' + str(
                        source) + '_' + str(target)
                    if completeLinkKey not in allLinksMap:
                        allLinksMap[completeLinkKey] = [len(allLinksMap), completeLinkInfo]

                    # 判断在这个时间，这个链接是不是已经有了，如果已经有了，那么直接进行下一步操作
                    if linkKey not in timeLinksKey:
                        timeLinksKey.append(linkKey)
                        # 保存链接信息
                        if linkKey not in linksMap:
                            # 起点 终点 【距离，小节下标，小节时间，回合索引，回合时间，起点x，起点y,起点z,起点speed,起点speedx,起点speedy,
                            # 终点x，终点y,终点z，终点speed,终点speedX,终点speedY】
                            linkObj = [source, target, [completeLinkKey]]
                            linksMap[linkKey] = linkObj
                        else:
                            linkObj = linksMap[linkKey]
                            disList = linkObj[2]
                            disList.append(completeLinkKey)
                            linkObj[2] = disList
                            linksMap[linkKey] = linkObj

                    # 保存连接到节点信息
                    anotherLinkInfo = [source, target, dis, quarterIndex, quarterTime, roundIndex, roundTime,
                                       sourceInfo[2], sourceInfo[3], sourceInfo[5], sourceInfo[6], sourceInfo[7],
                                       targetInfo[2], targetInfo[3], targetInfo[5], targetInfo[6], targetInfo[7]]
                    # 起点
                    sourceNode = nodesMap[str(source)]  # 起点
                    sourceNodeLinks = sourceNode['links']
                    sourceNodeLinksNum = sourceNode['linksnum'] + 1
                    sourceNodeLinks[2].append(completeLinkKey)
                    sourceNode['links'] = sourceNodeLinks
                    sourceNode['linksnum'] = sourceNodeLinksNum
                    nodesMap[str(source)] = sourceNode

                    # 终点
                    targetNode = nodesMap[str(target)]  # 终点
                    targetNodeLinks = targetNode['links']
                    targetNodeLinksNum = targetNode['linksnum'] + 1
                    targetNodeLinks[2].append(completeLinkKey)
                    targetNode['links'] = targetNodeLinks
                    targetNode['linksnum'] = targetNodeLinksNum
                    nodesMap[str(target)] = targetNode

                # 不同同队的链接
                for link in distanceLink:  # 球的链接
                    # 起点 终点 距离 链接key
                    source = link[0]
                    target = link[1]
                    dis = link[2]
                    linkKey = str(source) + '-' + str(target)

                    # 起点 终点 信息
                    sourceInfo = timePlayerMap[str(source)]
                    targetInfo = timePlayerMap[str(target)]
                    # link 信息
                    linkInfo = [dis, quarterIndex, quarterTime, roundIndex, roundTime,
                                sourceInfo[2], sourceInfo[3], sourceInfo[5], sourceInfo[6], sourceInfo[7],
                                targetInfo[2], targetInfo[3], targetInfo[5], targetInfo[6], targetInfo[7]]

                    # 完整的link信息
                    completeLinkInfo = [source, target, dis, quarterIndex, quarterTime, roundIndex, roundTime,
                                        timeIndex,
                                        sourceInfo[2], sourceInfo[3], sourceInfo[5], sourceInfo[6], sourceInfo[7],
                                        targetInfo[2], targetInfo[3], targetInfo[5], targetInfo[6], targetInfo[7]]
                    completeLinkKey = str(quarterIndex) + '_' + str(roundIndex) + '_' + str(timeIndex) + '_' + str(
                        source) + '_' + str(target)
                    if completeLinkKey not in allLinksMap:
                        allLinksMap[completeLinkKey] = [len(allLinksMap), completeLinkInfo]

                    # 判断在这个时间，这个链接是不是已经有了，如果已经有了，那么直接进行下一步操作
                    if linkKey not in timeLinksKey:
                        timeLinksKey.append(linkKey)
                        # 保存链接信息
                        if linkKey not in linksMap:
                            # 起点 终点 【距离，小节下标，小节时间，回合索引，回合时间，起点x，起点y,起点z,起点speed,起点speedx,起点speedy,
                            # 终点x，终点y,终点z，终点speed,终点speedX,终点speedY】
                            linkObj = [source, target, [completeLinkKey]]
                            linksMap[linkKey] = linkObj
                        else:
                            linkObj = linksMap[linkKey]
                            disList = linkObj[2]
                            disList.append(completeLinkKey)
                            linkObj[2] = disList
                            linksMap[linkKey] = linkObj
                    # 保存连接到节点信息
                    anotherLinkInfo = [source, target] + linkInfo
                    # 起点
                    sourceNode = nodesMap[str(source)]  # 起点
                    sourceNodeLinks = sourceNode['links']
                    sourceNodeLinksNum = sourceNode['linksnum'] + 1
                    sourceNodeLinks[3].append(completeLinkKey)
                    sourceNode['links'] = sourceNodeLinks
                    sourceNode['linksnum'] = sourceNodeLinksNum
                    nodesMap[str(source)] = sourceNode

                    # 终点
                    targetNode = nodesMap[str(target)]  # 终点
                    targetNodeLinks = targetNode['links']
                    targetNodeLinksNum = targetNode['linksnum'] + 1
                    targetNodeLinks[3].append(completeLinkKey)
                    targetNode['links'] = targetNodeLinks
                    targetNode['linksnum'] = targetNodeLinksNum
                    nodesMap[str(target)] = targetNode

    # 整理全部连接 到 有索引的值
    allLinkList = [1] * len(allLinksMap)
    for key in allLinksMap.keys():
        link = allLinksMap[key]
        index = link[0]
        allLinkList[index] = link[1]
    # 整理 nodes map 和 link map
    nodesList = []
    for key in nodesMap.keys():
        node = nodesMap[key]
        links = node['links']
        nodeLinks = [[], [], [], []]
        for linkKey in links[0]:
            index = allLinksMap[linkKey][0]
            nodeLinks[0].append(index)
        for linkKey in links[1]:
            index = allLinksMap[linkKey][0]
            nodeLinks[1].append(index)
        for linkKey in links[2]:
            index = allLinksMap[linkKey][0]
            nodeLinks[2].append(index)
        for linkKey in links[3]:
            index = allLinksMap[linkKey][0]
            nodeLinks[3].append(index)

        node['links'] = nodeLinks

        nodesList.append(node)
    # 对nodes进行排序
    nodesList = sorted(nodesList, key=lambda e: (e['teamdes'], e['isSP'] is False, e['playerid']))
    # nodesList = sorted(nodesList, key=lambda e: (e.__getitem__()))

    linksList = []
    for key in linksMap.keys():
        link = linksMap[key]
        linkKeyList = link[2]
        linkIndexList = []
        for linkKey in linkKeyList:
            index = allLinksMap[linkKey][0]
            linkIndexList.append(index)
        link[2] = linkIndexList
        linksList.append(link)

    # 网络数据
    graphData = {'nodes': nodesList, 'links': linksList, 'linksStore': allLinkList}
    data['gameGraphData'] = graphData
    # data['data'] = gameData
    return data


def getGamePlayerMap(gameID, homeTeam, visitorTeam):
    gamePlayerMap = {}
    homeTeamPlayers = homeTeam['players']
    for player in homeTeamPlayers:
        playerID = str(player['playerid'])
        player['teamid'] = homeTeam['teamid']
        player['teamabbr'] = homeTeam['abbreviation']
        player['teamdes'] = 'home'
        player['isSP'] = False
        player['courttime'] = []
        player['courttimenum'] = 0
        player['links'] = [[], [], [], []]
        player['linksnum'] = 0
        player['events'] = []

        gamePlayerMap[playerID] = player

        # print(1)
    visitorTeamPlayers = visitorTeam['players']
    for player in visitorTeamPlayers:
        playerID = str(player['playerid'])
        player['teamid'] = visitorTeam['teamid']
        player['teamabbr'] = visitorTeam['abbreviation']
        player['teamdes'] = 'visitor'
        player['isSP'] = False
        player['courttime'] = []
        player['courttimenum'] = 0
        player['links'] = [[], [], [], []]
        player['linksnum'] = 0
        player['events'] = []

        gamePlayerMap[playerID] = player
        # print(1)
    # 保存球的数据
    ballObj = {'lastname': '', 'firstname': 'ball', 'playerid': -1, 'jersey': '-1', 'position': '', 'teamid': -1,
               'teamabbr': '', 'teamdes': 'ball', 'isSP': False, 'courttime': [], 'courttimenum': 0,
               'links': [[], [], [], []],
               'linksnum': 0,
               'events': []}
    gamePlayerMap['-1'] = ballObj

    # 添加事件
    gameEventData = readGameEventFile(gameID=gameID)
    # 遍历 事件 数据
    for event in gameEventData:
        id1 = str(event['majorPlayerID'])
        id2 = str(event['secondPlayerID'])
        # 保存 事件 到球员
        if id1 in gamePlayerMap:
            playerObj = gamePlayerMap[id1]
            playerEvents = playerObj['events']
            playerEvents.append(event)
            playerObj['events'] = playerEvents
            gamePlayerMap[id1] = playerObj
        if id2 in gamePlayerMap:
            playerObj = gamePlayerMap[id2]
            playerEvents = playerObj['events']
            playerEvents.append(event)
            playerObj['events'] = playerEvents
            gamePlayerMap[id2] = playerObj
    # 返回 球员 数据
    return gamePlayerMap


def getTimePlayerMap(timePositionList):
    """
    通过时间位置序列 得到 这个时间 的 球员Map key 是 球员ID
    :param timePositionList:
    :return: 这个时刻的 球员 的 Map
    """
    timePlayerMap = {}
    for playerPosition in timePositionList:
        playerID = str(playerPosition[1])
        timePlayerMap[playerID] = playerPosition
    return timePlayerMap


# 读取 比赛图 数据
def readGameGraphFile(gameID):
    """
    读取比赛数据
    :param gameID: 比赛ID
    :return:
    """
    print('读取比赛数据', gameID)
    filePath = '/home/cbf/data/basketball/data collection/gamePositionDataWithSpeedAndGraphs/' + gameID + '.json'
    file = open(filePath)
    gameData = json.loads(file.readline())
    print('返回比赛数据', gameID)
    return gameData


def readGameEventFile(gameID):
    """
    读取比赛 事件 数据
    :param gameID: 比赛ID
    :return:
    """

    print('读取比赛 事件 数据', gameID)
    filePath = '/home/cbf/data/basketball/data collection/eventData/' + gameID + '.json'
    file = open(filePath)
    gameData = json.loads(file.readline())
    eventList = []
    for event in gameData:
        if event['eventType'] == 1:
            description = event['description']
            if '3pt' in description:
                event['scoreNum'] = 3
            else:
                event['scoreNum'] = 2

        if event['eventType'] == 3:
            description = event['description']
            # print(description)
            if 'miss' in description:
                event['scoreNum'] = 0
            else:
                event['scoreNum'] = 1

        eventList.append(event)

    print('返回比赛 事件 数据', gameID)
    return eventList


def saveJsonFile(data, filePath):
    print('一次性写入文件', filePath)
    file = open(filePath, 'a')
    file.write(json.dumps(data) + '\n')
    file.flush()
    file.close()
    print('写入完成')


if __name__ == '__main__':
    data = getGameGraphs('0021500001')
    saveJsonFile(data,
                 '/home/cbf/data/basketball/data collection/gamePositionDataWithSpeedAndGraphsGameGraphV2/' + '0021500001' + '.json')
    data = getGameGraphs('0021500002')
    saveJsonFile(data,
                 '/home/cbf/data/basketball/data collection/gamePositionDataWithSpeedAndGraphsGameGraphV2/' + '0021500002' + '.json')
    data = getGameGraphs('0021500003')
    saveJsonFile(data,
                 '/home/cbf/data/basketball/data collection/gamePositionDataWithSpeedAndGraphsGameGraphV2/' + '0021500003' + '.json')
    print(1)
    t1 = datetime.datetime.now()
    file = open(
        '/home/cbf/data/basketball/data collection/gamePositionDataWithSpeedAndGraphsGameGraphV2/' + '0021500003' + '.json')
    t2 = datetime.datetime.now()
    a = file.readline()
    t3 = datetime.datetime.now()
    b = json.loads(a)
    t4 = datetime.datetime.now()
    print(t2 - t1, t3 - t2, t4 - t3, t4 - t1)
    print(1)
