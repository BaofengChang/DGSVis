import json
import math
import numpy as np




# 得到细节数据
def getSnapshotDetails(gameID='0021500003', timeDataIndexList='[[1,2],[3,4],[5]]'):
    # 得到球员数据
    file = open('/home/cbf/data/basketball/data collection/GameData/gameGraph/' + gameID + '.json')
    gameData = json.loads(file.readline())
    playerMap = {}
    for player in gameData['homeTeam']['players']:
        playerID = str(player['playerid'])
        player['teamID'] = gameData['homeTeam']['teamid']
        player['teamAbbr'] = gameData['homeTeam']['abbreviation']
        player['teamDes'] = 'home'
        player['isSp'] = 0
        playerMap[playerID] = player
    for player in gameData['visitorTeam']['players']:
        playerID = str(player['playerid'])
        player['teamID'] = gameData['visitorTeam']['teamid']
        player['teamAbbr'] = gameData['visitorTeam']['abbreviation']
        player['teamDes'] = 'visitor'
        player['isSp'] = 0
        playerMap[playerID] = player
    # 确定 首发队员
    for playerPosition in gameData['data'][0][0][0][5]:
        if playerPosition[1] != -1:
            playerID = str(playerPosition[1])
            playerMap[playerID]['isSp'] = 1



    timeDataIndexList = json.loads(timeDataIndexList)
    # 得到每一个时间片 以及 时间片汇总数据
    timeSliceList, timeSliceSummary = getGameGraphDataBySelectedTimeIndex(gameID, timeDataIndexList)
    # 处理事件片数据
    timeSliceDetails, timeSliceSummaryDetails = processTimeSliceList(timeSliceList, timeSliceSummary)
    # 返回数据
    return {
        'details': timeSliceDetails,
        'summary': timeSliceSummaryDetails,
        'playerMap': playerMap
    }




# 处理时间细节数据
def processTimeSliceList(timeSliceList, timeSliceSummary):
    graphDetailsList = []
    # 遍历事件片数据
    for timeSlice in timeSliceList:
        nodeMap = {}
        linkMap = {}
        indexList = []
        unixTimeList = []
        # nodeAve = {}
        # linkVae = {}
        for data in timeSlice:
            index = data['index']
            indexList.append(index)
            timeData = data['data']
            # 得到 时间 等属性
            unixTime = timeData[0]
            unixTimeList.append(unixTime);
            periodIndex = timeData[1]
            periodTime = timeData[2]
            roundTime = timeData[4]
            positionList = timeData[6]
            linkListTmp = timeData[7]
            # 遍历节点
            for node in positionList:
                nodeID = node[1]  # 节点ID
                timeStampData = {'x': node[2],
                                 'y': node[3],
                                 'linkDistance': [],
                                 'linkTarget': [],
                                 'speed': node[5],
                                 'unixTime': unixTime,
                                 'periodIndex': periodIndex,
                                 'periodTime': periodTime,
                                 'roundTime': roundTime}
                # 保存数据
                if nodeID not in nodeMap:
                    nodeMap[nodeID] = {
                        'teamId': node[0],
                        'playerId': node[1],
                        'timeData': [timeStampData]
                    }
                else:
                    nodeMap[nodeID]['timeData'].append(timeStampData)
            # 遍历链接
            for link in linkListTmp:
                s = link[1]
                t = link[2]
                dis = link[3]
                # 时间戳数据
                timeStampData = {
                    'dis': dis,
                    'unixTime': unixTime,
                    'periodIndex': periodIndex,
                    'periodTime': periodTime,
                    'roundTime': roundTime
                }
                linkID = str(s) + '-' + str(t)
                if linkID not in linkMap:
                    linkMap[linkID] = {
                        's': s,
                        't': t,
                        'timeData': [timeStampData]
                    }
                else:
                    linkMap[linkID]['timeData'].append(timeStampData)
                # 保存节点数据
                nodeMap[s]['timeData'][-1]['linkTarget'].append(t)
                nodeMap[t]['timeData'][-1]['linkTarget'].append(s)
                nodeMap[s]['timeData'][-1]['linkDistance'].append(dis)
                nodeMap[t]['timeData'][-1]['linkDistance'].append(dis)

        # node list
        nodeList = []
        linkList = []
        for key in nodeMap.keys():
            nodeSummaryObj = nodeMap[key]
            nodeTimeData = nodeSummaryObj['timeData']
            for nodeTimeStamp in nodeTimeData:
                nodeTimeStamp['linkTarget'] = list(set(nodeTimeStamp['linkTarget']))
                nodeTimeStamp['linkDistance'] = list(set(nodeTimeStamp['linkDistance']))
            nodeList.append(nodeMap[key])
        for key in linkMap.keys():
            linkList.append(linkMap[key])

        # unixTimeList = list(set(unixTimeList))
        # unixTimeList = sorted(unixTimeList)
        # 构建 对象
        obj = {
            'nodes': nodeList,
            'links': linkList,
            'index': indexList,
            'unixTimeList': unixTimeList
        }
        graphDetailsList.append(obj)

    # 统计汇总数据
    nodeSummaryMap = {}
    linkSummaryMap = {}
    nodeSummaryList = []
    linkSummaryList = []
    indexSummaryList = []
    unixTimeSummaryList = []

    for data in timeSliceSummary:
        index = data['index']
        indexSummaryList.append(index)
        timeData = data['data']
        # 得到 时间 等属性
        unixTime = timeData[0]
        unixTimeSummaryList.append(unixTime)
        periodIndex = timeData[1]
        periodTime = timeData[2]
        roundTime = timeData[4]
        positionList = timeData[6]
        linkListTmp = timeData[7]
        # 遍历节点
        for node in positionList:
            nodeID = node[1]  # 节点ID
            timeStampData = {'x': node[2],
                             'y': node[3],
                             'linkTarget': [],
                             'linkDistance': [],
                             'speed': node[5],
                             'unixTime': unixTime,
                             'periodIndex': periodIndex,
                             'periodTime': periodTime,
                             'roundTime': roundTime}
            # 保存数据
            if nodeID not in nodeSummaryMap:
                nodeSummaryMap[nodeID] = {
                    'teamId': node[0],
                    'playerId': node[1],
                    'timeData': [timeStampData]
                }
            else:
                nodeSummaryMap[nodeID]['timeData'].append(timeStampData)
        # 遍历链接
        for link in linkListTmp:
            s = link[1]
            t = link[2]
            dis = link[3]
            timeStampData = {
                'dis': dis,
                'unixTime': unixTime,
                'periodIndex': periodIndex,
                'periodTime': periodTime,
                'roundTime': roundTime
            }
            linkID = str(s) + '-' + str(t)
            if linkID not in linkSummaryMap:
                linkSummaryMap[linkID] = {
                    's': s,
                    't': t,
                    'timeData': [timeStampData]
                }
            else:
                linkSummaryMap[linkID]['timeData'].append(timeStampData)
            # 保存节点数据
            nodeSummaryMap[s]['timeData'][-1]['linkTarget'].append(t)
            nodeSummaryMap[t]['timeData'][-1]['linkTarget'].append(s)
            nodeSummaryMap[s]['timeData'][-1]['linkDistance'].append(dis)
            nodeSummaryMap[t]['timeData'][-1]['linkDistance'].append(dis)


        # node list
    for key in nodeSummaryMap.keys():
        nodeSummaryObj = nodeSummaryMap[key]
        nodeTimeData = nodeSummaryObj['timeData']
        for nodeTimeStamp in nodeTimeData:
            nodeTimeStamp['linkTarget'] = list(set(nodeTimeStamp['linkTarget']))
            nodeTimeStamp['linkDistance'] = list(set(nodeTimeStamp['linkDistance']))
            # nodeTimeStamp['linkDistance'] = 1
        nodeSummaryList.append(nodeSummaryMap[key])
    for key in linkSummaryMap.keys():
        linkSummaryList.append(linkSummaryMap[key])


    # 构建 对象
    graphSummaryObj = {
        'nodes': nodeSummaryList,
        'links': linkSummaryList,
        'index': indexSummaryList,
        'unixTimeList': unixTimeSummaryList
    }


    return graphDetailsList, graphSummaryObj


# 选择数据
def getGameGraphDataBySelectedTimeIndex(gameID, timeDataIndexList):
    gameGraphList = getGameGraphDataInTimeList(gameID)
    timeSliceList = []
    timeSliceSummary = []
    for indexInfo in timeDataIndexList:
        timeSliceList.append([])
        for index in indexInfo:
            timeSliceList[-1].append({'data': gameGraphList[index], 'index': index})
            timeSliceSummary.append({'data': gameGraphList[index], 'index': index})
    return timeSliceList, timeSliceSummary


# 读取按照时间顺序的 图 数据
def getGameGraphDataInTimeList(gameID='0021500003'):
    filePath = '/home/cbf/data/basketball/data collection/GameData/playerDataLinkDataTimeData/time_' + gameID + '.json'
    file = open(filePath)
    # 得到 时间顺序 的 数据
    data = json.loads(file.readline())
    data = data['timeList']
    return data


if __name__ == '__main__':
    # 测试 得到细节数据
    # print(json.dumps([1, 2], [3, 4], [5]))
    getSnapshotDetails()
    print(1)
