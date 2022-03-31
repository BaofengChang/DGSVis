import json

from DynamicGraph.server2.getRoundData import getRoundData


# 读取回合 数据
def getRoundDetailsData(gameID='0021500003', roundSelection='[[1,0]]', linkType='[1, 2, 3]'):
    # 读取数据
    # 读取数据
    # file = open(
    #     '/home/cbf/data/basketball/data collection/GameData/playerDataLinkDataTimeData/time_' + gameID + '.json')
    file1 = open(
        '/home/cbf/data/basketball/data collection/GameData/gameGraph/' + gameID + '.json')
    # 转化为json
    gameData1 = json.loads(file1.readline())
    # 回合 选择， 转化为 json 数据
    roundSelection = json.loads(roundSelection)
    # 用来 表示 热力图
    roundDataList = []  #
    graphList = []  # 图 列表

    # 这个 回合 内 的 节点 和 连接
    roundNodes = {}
    roundLinks = {}
    totalHeatMap = {}

    if len(roundSelection) == 0:
        graphList.append(dividedGraph(gameData1['data'][0][0], linkType))
        roundData = gameData1['data'][0][0]
        nodesInfo, linksInfo = heatMap(roundData, {}, {})
        roundDataList.append({'nodes': nodesInfo,
                              'links': linksInfo,
                              'quarterIndex': 0,
                              'roundIndex': 0})

    for roundInfo in roundSelection:
        qs = roundInfo[0]  # 选中的 小节
        rs = roundInfo[1]  # 选中的 回合
        roundData = gameData1['data'][qs][rs]  # 回合 数据
        # 划分 图
        graphList.append(dividedGraph(roundData, linkType))
        # 计算热力图
        nodesInfo, linksInfo = heatMap(roundData, {}, {})
        roundDataList.append({'nodes': nodesInfo,
                              'links': linksInfo,
                              'quarterIndex': qs,
                              'roundIndex': rs})  # 保存 回合 数据

    del gameData1['data']
    gameData1['roundDataList'] = roundDataList
    gameData1['graphList'] = graphList
    return gameData1


def dividedGraph(roundData, linkLable='[2]'):
    linkLable = json.loads(linkLable)
    sameGraphV1 = []
    sameGraphObj = {}
    for timeIndex, timeData in enumerate(roundData):
        quarterTime = timeData[3]
        roundTime = timeData[4]
        nodesList = timeData[5]  # 得到 节点 数据
        linksList = timeData[6]  # 得到 连接 数据
        linkKeyList = []
        for link in linksList:
            if link[0] not in linkLable:
                continue
            sid = link[1]
            tid = link[2]
            dis = link[3]
            if sid == -1 or tid == -1:
                continue
            linkKey = str(sid) + 'to' + str(tid)
            if linkKey not in linkKeyList:
                linkKeyList.append(linkKey)
        linkKeyList = sorted(linkKeyList)
        graphKey = '-'.join(linkKeyList)
        timeObj = {
            'key': graphKey,
            'data': [timeData]
        }
        # 判断 这个图 能不能 合并
        if len(sameGraphV1) == 0:
            sameGraphV1.append(timeObj)
        else:
            if graphKey == sameGraphV1[-1]['key']:
                sameGraphV1[-1]['data'].append(timeData)
            else:
                sameGraphV1.append(timeObj)

    graphList = []
    for graph in sameGraphV1:
        data = graph['data']
        nodes = {}
        links = {}
        for timeData in data:
            quarterTime = timeData[3]  # 小节 时间
            roundTime = timeData[4]  # 回合 时间
            nodesList = timeData[5]  # 得到 节点 数据
            linksList = timeData[6]  # 得到 连接 数据
            # 保存 节点 信息
            for node in nodesList:
                nodeid = node[1]
                # 如果没有这个节点 那么 增加这个节点进行保存
                if nodeid not in nodes:
                    nodeObj = {
                        'nodeId': nodeid,
                        'teamId': node[0],
                        'position': [],
                    }
                    nodes[nodeid] = nodeObj
                nodeObj = nodes[nodeid]
                # 运动员 x, y, s, sx, sy
                x = node[2]
                y = node[3]
                s = node[5]
                sx = node[6]
                sy = node[7]
                position = {
                    'x': x,
                    'y': y,
                    's': s,
                    'sx': sx,
                    'sy': sy,
                    'quarterTime': quarterTime,
                    'roundTime': roundTime
                }
                nodeObj['position'].append(position)
                nodes[nodeid] = nodeObj
            # 保存 链接 消息
            for link in linksList:
                sid = link[1]
                tid = link[2]
                dis = link[3]
                if sid == -1 or tid == -1:
                    continue
                linkKey = str(sid) + 'to' + str(tid)
                # 当连接不存在的时候 构建
                if linkKey not in links:
                    linkObj = {
                        'sid': sid,
                        'steam': nodes[sid]['teamId'],
                        'tid': tid,
                        'tteam': nodes[tid]['teamId'],
                        'dis': [],
                        'sPosition': [],
                        'tPosition': [],
                    }
                    # print(1)
                    links[linkKey] = linkObj
                linkObj = links[linkKey]
                sPosition = nodes[sid]['position'][-1]
                tPosition = nodes[tid]['position'][-1]
                linkObj['sPosition'].append(sPosition)
                linkObj['tPosition'].append(tPosition)
                linkObj['dis'].append(dis)
                links[linkKey] = linkObj

        nodesTmp = []
        linksTmp = []
        for key in nodes.keys():
            nodesTmp.append(nodes[key])
        for key in links.keys():
            linksTmp.append(links[key])
        graphList.append({
            'nodes': nodesTmp,
            'links': linksTmp
        })
    # 返回值
    return graphList


# 生成 热力图
def heatMap(roundData, nodes, links):
    for timeIndex, timeData in enumerate(roundData):
        quarterTime = timeData[3]
        roundTime = timeData[4]
        nodesList = timeData[5]  # 得到 节点 数据
        linksList = timeData[6]  # 得到 连接 数据
        cellWidth = 9.4
        cellHeight = 5.0
        for node in nodesList:
            nodeid = node[1]
            # 如果没有这个节点 那么 增加这个节点进行保存
            if nodeid not in nodes:
                nodeObj = {
                    'nodeId': nodeid,
                    'teamId': node[0],
                    'position': [],
                    'linkPosition': [],
                    'positionCell': {},
                    'linkPositionCell': {},
                }
                nodes[nodeid] = nodeObj
            nodeObj = nodes[nodeid]
            x = node[2]
            y = node[3]
            s = node[5]
            cellx = int(x / cellWidth)
            celly = int(y / cellHeight)
            cellKey = str(cellx) + '-' + str(celly)
            positionObj = {
                'x': x,
                'y': y,
                's': s,
                'quarterTime': quarterTime,
                'roundTime': roundTime
            }
            cellObj = {
                'x': cellx,
                'y': celly,
                's': s,
                'quarterTime': quarterTime,
                'roundTime': roundTime,
            }
            nodeObj['position'].append(positionObj)
            if cellKey not in nodeObj['positionCell']:
                nodeObj['positionCell'][cellKey] = [cellObj]
            else:
                nodeObj['positionCell'][cellKey].append(cellObj)

        # 保存链接信息
        for link in linksList:
            sid = link[1]
            tid = link[2]
            dis = link[3]
            if sid == -1 or tid == -1:
                continue
            linkKey = str(sid) + 'to' + str(tid)
            # 当连接不存在的时候 构建
            if linkKey not in links:
                linkObj = {
                    'sid': sid,
                    'tid': tid,
                    'dis': [],
                    'sPosition': [],
                    'tPosition': [],
                    'tPositionCell': {},
                    'sPositionCell': {}
                }
                # print(1)
                links[linkKey] = linkObj
            linkObj = links[linkKey]
            sPosition = json.loads(json.dumps(nodes[sid]['position'][-1]))
            # sPosition['linkPlayerID'] = tid
            tPosition = json.loads(json.dumps(nodes[tid]['position'][-1]))
            linkObj['sPosition'].append(sPosition)
            linkObj['tPosition'].append(tPosition)
            linkObj['dis'].append(dis)
            sCellx = int(sPosition['x'] / cellWidth)
            sCelly = int(sPosition['y'] / cellHeight)
            sCellKey = str(sCellx) + '-' + str(sCelly)
            sCellObj = {
                'x': sCellx,
                'y': sCelly,
                's': sPosition['s'],
                'quarterTime': quarterTime,
                'roundTime': roundTime,
            }
            if sCellKey not in linkObj['sPositionCell']:
                linkObj['sPositionCell'][sCellKey] = [sCellObj]
            else:
                linkObj['sPositionCell'][sCellKey].append(sCellObj)
            tCellx = int(tPosition['x'] / cellWidth)
            tCelly = int(tPosition['y'] / cellHeight)
            tCellKey = str(tCellx) + '-' + str(tCelly)
            tCellObj = {
                'x': tCellx,
                'y': tCelly,
                's': tPosition['s'],
                'quarterTime': quarterTime,
                'roundTime': roundTime,
            }
            if tCellKey not in linkObj['tPositionCell']:
                linkObj['tPositionCell'][tCellKey] = [tCellObj]
            else:
                linkObj['tPositionCell'][tCellKey].append(tCellObj)
            links[linkKey] = linkObj

            # 保存 连接 的 节点信息
            snode = nodes[sid]
            tnode = nodes[tid]
            snode['linkPosition'].append(snode['position'][-1])
            tnode['linkPosition'].append(tnode['position'][-1])
            if sCellKey not in snode['linkPositionCell']:
                snode['linkPositionCell'][sCellKey] = [sCellObj]
            else:
                snode['linkPositionCell'][sCellKey].append(sCellObj)
            if tCellKey not in tnode['linkPositionCell']:
                tnode['linkPositionCell'][tCellKey] = [tCellObj]
            else:
                tnode['linkPositionCell'][tCellKey].append(tCellObj)
            nodes[sid] = snode
            nodes[tid] = tnode
    # 处理 节点 信息
    nodeList = mergeNodes(nodes)
    # 处理 连接 信息
    linkList = mergeLinks(links)
    # 构建回合信息=

    return nodeList, linkList




def mergeLinks(links):
    linkList = []
    for linkKey in links.keys():
        link = links[linkKey]
        sPositionCell = link['sPositionCell']
        sPositionCellList = []
        for key in sPositionCell.keys():
            cellList = sPositionCell[key]
            cellObj = {
                'x': cellList[0]['x'],
                'y': cellList[0]['y'],
                'num': len(cellList)
            }
            sPositionCellList.append(cellObj)
        link['sPositionCell'] = sPositionCellList
        tPositionCell = link['tPositionCell']
        tPositionCellList = []
        for key in tPositionCell.keys():
            cellList = tPositionCell[key]
            cellObj = {
                'x': cellList[0]['x'],
                'y': cellList[0]['y'],
                'num': len(cellList)
            }
            tPositionCellList.append(cellObj)
        link['tPositionCell'] = tPositionCellList

        linkList.append(link)
    return linkList


def mergeNodes(nodes):
    nodeList = []
    for nodeid in nodes.keys():
        node = nodes[nodeid]
        positionCell = node['positionCell']
        positionCellList = []
        for key in positionCell.keys():
            cellList = positionCell[key]
            cellObj = {
                'x': cellList[0]['x'],
                'y': cellList[0]['y'],
                'num': len(cellList)
            }
            positionCellList.append(cellObj)
        node['positionCell'] = positionCellList
        linkPositionCell = node['linkPositionCell']
        linkPositionCellList = []
        for key in linkPositionCell.keys():
            cellList = linkPositionCell[key]
            cellObj = {
                'x': cellList[0]['x'],
                'y': cellList[0]['y'],
                'num': len(cellList)
            }
            linkPositionCellList.append(cellObj)
        node['linkPositionCell'] = linkPositionCellList
        nodeList.append(node)
    return nodeList


if __name__ == '__main__':
    getRoundDetailsData()
    print(1)
