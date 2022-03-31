import json
import math
import numpy as np


def test_getRawTreeData(gameID='0021500003', startTime=20, endTime=100):
    # 给出原始数据
    rawData = getTreeRootSequenceVector(gameID, startTime, endTime)
    rawData = dealWithRawTimeList(gameID, rawData)
    # 返回数据
    return rawData


# 得到树图数据
def test_getTreeData(gameID='0021500003', zoneDivided=None, nodeThreshold=0, linkThreshold=0.5, timeGapThreshold=3.0,
                     brushedStartIndex=20, brushedEndIndex=100):
    # 初始化 变量
    if zoneDivided is not None:
        #     zone = [[1, 2, 3],[4,5,6,7]]
        zoneDivided = json.loads(zoneDivided)

    # print(zoneDivided)
    # 得到 等待划分 的时间片文件
    timeListWaitToDivide = getSequenceVector(gameID, zoneDivided, brushedStartIndex, brushedEndIndex)
    # 对等待的时间片进行划分
    mergedTimeData = divideSnapshotsByThresholdV4(gameID, timeListWaitToDivide, nodeThreshold, linkThreshold,
                                                  timeGapThreshold)
    # 返回已经划分好的数据
    return mergedTimeData


def test_getTreeDataByAverageMerge(gameID='0021500003', zoneDivided=None, timeSliceNum=2, brushedStartIndex=20,
                                   brushedEndIndex=100):
    if zoneDivided is not None:
        #     zone = [[1, 2, 3],[4,5,6,7]]
        zoneDivided = json.loads(zoneDivided)
    # zoneDivided = [[1, 2, 3], [4, 5, 6, 7], [234], [34, 34, 423]]
    # 得到 等待划分 的时间片文件
    timeListWaitToDivide = getSequenceVector(gameID, zoneDivided, brushedStartIndex, brushedEndIndex)
    # 对等待 划分的数据进行均匀划分
    mergedTimeData = divideSnapshotsByThresholdV5(gameID, timeListWaitToDivide, timeSliceNum)
    # 返回已经划分好的数据
    return mergedTimeData


def getTreeRootSequenceVector(gameID='0021500003', startTime=0, endTime=720):
    nodeMap, linkMap = getNodeAndLinkMap(gameID=gameID)
    # 读取数据
    timeDataGraphList = getGameGraphDataInTimeList(gameID=gameID)
    # 时序网络向量
    timeGraphVectorList = []
    # 刷选的索引
    brushedIndexList = []
    for timeIndex, timeGraph in enumerate(timeDataGraphList):
        timeStamp = (timeGraph[1] + 1) * 720 - timeGraph[2]
        if startTime <= timeStamp <= endTime:
            brushedIndexList.append(timeIndex)
        timeGraphVectorList.append(
            generateTopologyVectorOfGraph(timeGraphData=timeGraph, nodeMap=nodeMap, linkMap=linkMap))
    # 获取数据
    timeGraphVectorListWaitingDividing = []
    for timeIndex in brushedIndexList:
        # obj = {}
        # 得到这个时刻的向量
        timeDataGraphVector = timeGraphVectorList[timeIndex]
        obj = {
            # 设置这个时间段的 起始时间，结束时间，节点向量，终点向量，时间索引
            'sTime': timeDataGraphVector['timeInfo'],
            'eTime': timeDataGraphVector['timeInfo'],
            'nodeVector': timeDataGraphVector['nodeVector'],
            'nodeVectorV2': timeDataGraphVector['nodeVector'],
            'linkVector': timeDataGraphVector['linkVector'],
            'linkVectorV2': timeDataGraphVector['linkVector'],
            'indexList': [timeIndex]
        }
        timeGraphVectorListWaitingDividing.append(obj)
    # for timeGraph in timeDataGraphList
    return timeGraphVectorListWaitingDividing


# 得到 待划分的 序列格式
def getSequenceVector(gameID='0021500003', zone=None, startIndex=None, endIndex=None):
    """
    :param gameID: 比赛 id
    :param zone:  分区信息，如果有分区信息，那么说明是已经经过了一次划分。
    :return:
    """
    # 读取nodemap 和 linkmap
    # node的向量索引，link的向量索引
    # 初始化
    # if zone is None:
    #     zone = [[1, 2, 3],[4,5,6,7],[78,4]]
    nodeMap, linkMap = getNodeAndLinkMap(gameID=gameID)
    # 读取数据
    timeDataGraphList = getGameGraphDataInTimeList(gameID=gameID)
    # 时序网络向量
    timeGraphVectorList = []
    for timeGraph in timeDataGraphList:
        timeGraphVectorList.append(
            generateTopologyVectorOfGraph(timeGraphData=timeGraph, nodeMap=nodeMap, linkMap=linkMap))
    # timeGraphVectorIndexList = []
    timeGraphVectorListWaitingDividing = []
    if zone is None:
        if startIndex is not None and endIndex is not None:
            for timeIndex in range(startIndex, endIndex + 1):
                # 得到这个时刻的向量
                timeDataGraphVector = timeGraphVectorList[timeIndex]
                obj = {
                    # 设置这个时间段的 起始时间，结束时间，节点向量，终点向量，时间索引
                    'sTime': timeDataGraphVector['timeInfo'],
                    'eTime': timeDataGraphVector['timeInfo'],
                    'nodeVector': timeDataGraphVector['nodeVector'],
                    'nodeVectorV2': timeDataGraphVector['nodeVector'],
                    'linkVector': timeDataGraphVector['linkVector'],
                    'linkVectorV2': timeDataGraphVector['linkVector'],
                    'indexList': [timeIndex]
                }
                timeGraphVectorListWaitingDividing.append(obj)
        else:
            # 如果没有分区信息，那么就是
            for timeIndex, timeData in enumerate(timeDataGraphList):
                # obj = {}
                # 得到这个时刻的向量
                timeDataGraphVector = timeGraphVectorList[timeIndex]
                obj = {
                    # 设置这个时间段的 起始时间，结束时间，节点向量，终点向量，时间索引
                    'sTime': timeDataGraphVector['timeInfo'],
                    'eTime': timeDataGraphVector['timeInfo'],
                    'nodeVector': timeDataGraphVector['nodeVector'],
                    'nodeVectorV2': timeDataGraphVector['nodeVector'],
                    'linkVector': timeDataGraphVector['linkVector'],
                    'linkVectorV2': timeDataGraphVector['linkVector'],
                    'indexList': [timeIndex]
                }
                timeGraphVectorListWaitingDividing.append(obj)
    else:
        for zoneElement in zone:
            indexList = zoneElement
            # 设置对象
            obj = {
                'sTime': timeGraphVectorList[indexList[0]]['timeInfo'],
                'eTime': timeGraphVectorList[indexList[-1]]['timeInfo'],
                'indexList': indexList
            }
            # 合并节点向量，连接向量
            vectorObj = combineVector(timeGraphVectorList, indexList)
            obj['nodeVector'] = vectorObj['nodeVectorUnit']
            obj['nodeVectorV2'] = vectorObj['nodeVectorSum']
            obj['linkVector'] = vectorObj['linkVectorUnit']
            obj['linkVectorV2'] = vectorObj['linkVectorSum']

            timeGraphVectorListWaitingDividing.append(obj)

    # 返回等待划分的数据
    return timeGraphVectorListWaitingDividing


# 合并向量
def combineVector(vectorList, indexList):
    # 根据 索引序列 合并向量
    # 初始向量
    nodeVector = vectorList[indexList[0]]['nodeVector']
    linkVector = vectorList[indexList[0]]['linkVector']
    # 按照索引对向量求和
    for i in range(1, len(indexList)):
        index = i
        nodeVectorTmp = vectorList[indexList[index]]['nodeVector']
        linkVectorTmp = vectorList[indexList[index]]['linkVector']
        nodeVector = nodeVector + nodeVectorTmp
        linkVector = linkVector + linkVectorTmp

    # 对向量进行处理，把大于1的位置为1，2就是 不设置为1
    nodeVector1 = nodeVector
    nodeVector2 = np.float64(nodeVector > 0)
    linkVector1 = linkVector
    linkVector2 = np.float64(linkVector > 0)
    # 返回数据
    return {
        'nodeVectorSum': nodeVector1,
        'nodeVectorUnit': nodeVector2,
        'linkVectorSum': linkVector1,
        'linkVectorUnit': linkVector2,
    }


# 生成根据拓扑结构生成特征向量，序列形式
def generateTopologyVectorOfGraph(timeGraphData, nodeMap, linkMap):
    # time info--> unix time, period time, round time
    time = [timeGraphData[0], timeGraphData[2], timeGraphData[4], timeGraphData[1]]
    # init zero node vector & link vector
    nodeVector = np.zeros(len(nodeMap))
    linkVector = np.zeros(len(linkMap))
    # get node info list (graph node) and link info list (graph link)
    graphNodeList = timeGraphData[6]
    graphLinkList = timeGraphData[7]
    # traverse node of graph node
    for node in graphNodeList:
        # node ID
        ID = node[1]
        # ignore ball node (node ID = -1)
        if ID == -1:
            continue
        # vector index of node and assign the node vector
        nodeVectorIndex = nodeMap[ID]
        nodeVector[nodeVectorIndex] = 1
    # traverse link of graph link
    for link in graphLinkList:
        # link source ID ,target ID
        sourceID = link[1]
        targetID = link[2]
        # ignore ball link (sourceID = -1)
        if sourceID == -1:
            continue
        # link ID --> source ID to target ID
        linkID = str(sourceID) + 'to' + str(targetID)
        # vector index of link and assign the link vector
        linkVectorIndex = linkMap[linkID]
        linkVector[linkVectorIndex] = 1

    # constructing time graph vector: timeInfo, nodeVector, linkVector
    timeGraphVector = {
        'timeInfo': time,
        'nodeVector': nodeVector,
        'linkVector': linkVector
    }
    # return time graph vector
    return timeGraphVector


# 计算向量差值，返回结果为1范数
def computeDifferenceBetweenVector(timeVector1, timeVector2, wv=0.5, we=0.5):
    # two time information of two time graph vector: time 1 and time 2
    # time1 = timeVector1['timeInfo']
    # time2 = timeVector2['timeInfo']
    # two node Vector of two time graph vector: nodeVector1 and nodeVector2
    nodeVector1 = timeVector1['nodeVector']
    nodeVector2 = timeVector2['nodeVector']
    # two link vector of two time graph vector: linkVector1 and linkVector2
    linkVector1 = timeVector1['linkVector']
    linkVector2 = timeVector2['linkVector']
    # assign the nodeVector weight and linkVector weight to node vector and link vector
    # nodeVector1 = wv * nodeVector1
    # nodeVector2 = wv * nodeVector2
    # linkVector1 = we * linkVector1
    # linkVector2 = we * linkVector2
    # compute node vector difference: v1 - v2
    nodeVectorDifference = nodeVector1 - nodeVector2
    # compute link vector difference: l1 - l2
    linkVectorDifference = linkVector1 - linkVector2
    # compute 1-norm of node vector difference and link vector difference
    nodeNorm = np.linalg.norm(x=nodeVectorDifference, ord=1)
    linkNorm = np.linalg.norm(x=linkVectorDifference, ord=1)
    # compute positive node number and positive link number in time vector 1
    nodePositiveNum = np.linalg.norm(x=nodeVector1, ord=1)
    linkPositiveNum = np.linalg.norm(x=linkVector1, ord=1)

    # nodePositiveNum = len(np.argwhere(nodeVector1))
    # linkPositiveNum = len(np.argwhere(linkVector1))
    # nodePositiveNum = len(np.argwhere(nodeVector1 + nodeVector2))
    # linkPositiveNum = len(np.argwhere(linkVector1 + linkVector2))
    # compute change relative change difference of node and link-> nodeNorm/nodePositiveNum, linkNum/linkPositiveNUm
    nodeRelativeChangeIndex = nodeNorm / nodePositiveNum
    linkRelativeChangeIndex = linkNorm / linkPositiveNum
    # if linkRelativeChangeIndex > 0.5:
    #     print(1)
    # compute the time gap
    # timeGap = unixTimeDifference(time1[0], time2[0])
    # return 1-norm of node vector, link vector, time gap

    return nodeRelativeChangeIndex, linkRelativeChangeIndex


# 计算差值
def computeTimeDifference(time1, time2):
    # set time gap to return
    timeGap = 0
    # two time information of two time information: time 1 and time 2
    unixTime1 = time1[0]
    unixTime2 = time2[0]
    # compute the time gap
    timeGap = unixTimeDifference(unixTime1, unixTime2)
    # return time value
    return timeGap


# 计算 时间的差值
def unixTimeDifference(smallUnixTime: int, bigUnixTime: int):
    # 计算两个unix时间的差值
    utDiff = abs(bigUnixTime - smallUnixTime)
    # 除以1000，就是秒
    seconds = utDiff / 1000
    return seconds


# 筛选数据，1000个
def sampleData(gameID='0021500003'):
    # 读取数据
    filePath = '/home/cbf/data/basketball/data collection/GameData/playerDataLinkDataTimeData/time_' + gameID + '.json'
    file = open(filePath)
    data = json.loads(file.readline())
    data = data['timeList']
    file.close()

    # 设置采样多少数据
    num = 1000
    timeDataList = []

    # 筛选数据
    for i in range(num):
        timeData = data[i]
        timeDataList.append(timeData)

    # 设置写入文件的格式
    saveData = {
        'gameID': gameID,
        'timeList': timeDataList
    }
    # 把采样的数据写入文件
    writeFilePath = '/home/cbf/data/basketball/data collection/GameData/divide time/test data/1000tips-' + gameID + '.json'
    writeFile = open(writeFilePath, 'w')
    writeFile.write(json.dumps(saveData))
    writeFile.flush()
    writeFile.close()

    print(1)


# 读取 节点 和 连接对应的 vector 索引
def getNodeAndLinkMap(gameID='0021500003'):
    filepath = '/home/cbf/data/basketball/data collection/GameData/gameGraph/game_' + gameID + '.json'
    file = open(filepath)
    # 得到节点数据 和 连接 数据
    data = json.loads(file.readline())['data']
    nodes = data['nodes']
    links = data['links']
    # 构建 节点 对应的 向量索引
    # 构建 连接 对应的 向量索引
    nodeMap = {}
    linkMap = {}
    for i, node in enumerate(nodes):
        ID = node['ID']
        nodeMap[ID] = i
    for i, link in enumerate(links):
        ID = str(link['s']) + 'to' + str(link['t'])
        linkMap[ID] = i
    # 返回数据
    return nodeMap, linkMap


# 读取按照时间顺序的 图 数据
def getGameGraphDataInTimeList(gameID='0021500003'):
    filePath = '/home/cbf/data/basketball/data collection/GameData/divide time/test data/1000tips-' + gameID + '.json'
    file = open(filePath)
    # 得到 时间顺序 的 数据
    data = json.loads(file.readline())
    data = data['timeList']
    return data


def divideSnapshotsByThresholdV3(gameID='0021500003', nr=1.0, lr=1.0, tr=3.0):
    """
    根据用户参数 划分时间片
    :param gameID: game id
    :param nr: node change range / threshold
    :param lr: link change range / threshold
    :param tr: time gap range / threshold
    :return: merged time list, threshold statistic
    """
    # 权重统计，统计因为哪些权重而不能聚合事件片
    nrFalseSum = 0
    lrFalseSum = 0
    trFalseSum = 0
    # node的向量索引，link的向量索引
    nodeMap, linkMap = getNodeAndLinkMap(gameID=gameID)
    # 时序网络数据
    timeListGraphData = getGameGraphDataInTimeList(gameID=gameID)
    # 时序网络向量
    timeListVectorData = []
    for timeGraph in timeListGraphData:
        timeListVectorData.append(
            generateTopologyVectorOfGraph(timeGraphData=timeGraph, nodeMap=nodeMap, linkMap=linkMap))
    # 时间聚合的结果, 并初始化第一个时间聚合的时间戳
    timeMergedList = [[0]]
    # 遍历时序网络数据
    i = 1
    while i < (len(timeListGraphData)):
        # current time graph & next time graph
        # cTimeGraph = timeListGraphData[i]  # 当前时刻网络数据
        # bTimeGraph = timeMergedList[-1][0]  # 从已经聚合的时间片中提取需要对比的时刻网络数据，是已经聚合的时间片

        # cTimeGraph = timeListGraphData[i]  # 下一个时刻的网络数据
        # 构建当前时刻的向量，构建下一个时刻的向量
        bTimeVector = timeListVectorData[timeMergedList[-1][0]]
        # lTimeVector = timeListVectorData[timeMergedList[-1][-1]]
        cTimeVector = timeListVectorData[i]
        # compute the node vector difference and link vector difference
        nodeRelativeChangeIndex, linkRelativeChangeIndex, = computeDifferenceBetweenVector(bTimeVector, cTimeVector)
        # nodeRelativeChangeIndex2, linkRelativeChangeIndex2, = computeDifferenceBetweenVector(lTimeVector, cTimeVector)
        # average node difference and link defference
        nChangeIndex = nodeRelativeChangeIndex
        lChangeIndex = linkRelativeChangeIndex
        # nChangeIndex = (nodeRelativeChangeIndex + nodeRelativeChangeIndex2) / 2
        # lChangeIndex = (linkRelativeChangeIndex + linkRelativeChangeIndex2) / 2
        # compute the time difference
        # notice: time gap is computed between the last merged time and current time
        timeGap = computeTimeDifference(timeListGraphData[timeMergedList[-1][-1]], timeListGraphData[i])
        # set merge flag: node merge flag, link merge flag, time merge flag.
        # initial flag value is True
        nodeMergeFlag = True
        linkMergeFlag = True
        timeMergeFlag = True
        # compare change index with threshold, and compute the False number
        if nChangeIndex > nr:
            nodeMergeFlag = False
            nrFalseSum += 1
        if lChangeIndex > lr:
            linkMergeFlag = False
            lrFalseSum += 1
        if timeGap > tr:
            timeMergeFlag = False
            trFalseSum += 1
        # judge whether merge current time into time stamp
        if nodeMergeFlag and linkMergeFlag and timeMergeFlag:
            # todo: merge
            timeMergedList[-1].append(i)
            # print(1)
        else:
            timeMergedList.append([i])
        i += 1
        print(i)

    # return graph data by time list, merged index by list in list
    return timeListGraphData, timeMergedList


# 比较两个时间片
def compareTimeSlice(baseTimeSliceObj, currentTimeSliceObj):
    # 得到基础时间片的数据
    # baseTimeNodeVector = baseTimeSliceObj['nodeVector']
    # baseTimeLinkVector = baseTimeSliceObj['linkVector']
    baseEndTimeInfo = baseTimeSliceObj['eTime']
    # 得到当前时间片的数据
    # currentTimeNodeVector = currentTimeSliceObj['nodeVector']
    # currentTimeLinkVector = currentTimeSliceObj['linkVector']
    currentStartTimeInfo = currentTimeSliceObj['sTime']

    # 计算时间差值
    timeGap = unixTimeDifference(baseEndTimeInfo[0], currentStartTimeInfo[0])

    # 计算 节点 差值
    nodeChangeIndex, linkChangeIndex = computeDifferenceBetweenVector(baseTimeSliceObj, currentTimeSliceObj)

    return nodeChangeIndex, linkChangeIndex, timeGap


# 聚合 时间片按照权重
def divideSnapshotsByThresholdV4(gameID, timeListWaitToDivide, nodeChangeThreshold, linkChangeThreshold,
                                 timeGapThreshold):
    # 权重统计，统计因为哪些权重而不能聚合事件片
    nrFalseSum = 0
    lrFalseSum = 0
    trFalseSum = 0
    # 设置聚合结果，并初始化第一个时间聚合片段
    timeMergeList = []
    timeMergeIndexList = []
    if len(timeListWaitToDivide) > 0:
        timeMergeList.append([timeListWaitToDivide[0]])
        timeMergeIndexList.append([0])

    # 遍历时序网络数据
    i = 1
    while i < len(timeListWaitToDivide):
        # 基础时间片数据
        baseTimeSliceObj = timeMergeList[-1][0]
        # 当前时间片数据
        currentTimeSliceObj = timeListWaitToDivide[i]
        # 比较两个时间片的数据，将当前时间片和基础时间片进行比较
        nodeChange, linkChang, timeGap = compareTimeSlice(baseTimeSliceObj, currentTimeSliceObj)
        # 判定是不是要聚合到一起
        nodeMergeFlag = True
        linkMergeFlag = True
        timeMergeFlag = True
        # compare change index with threshold, and compute the False number
        if nodeChange > nodeChangeThreshold:
            nodeMergeFlag = False
            nrFalseSum += 1
        if linkChang > linkChangeThreshold:
            linkMergeFlag = False
            lrFalseSum += 1
        if timeGap > timeGapThreshold:
            timeMergeFlag = False
            trFalseSum += 1
        # judge whether merge current time into time stamp
        if nodeMergeFlag and linkMergeFlag and timeMergeFlag:
            # todo: merge
            timeMergeList[-1].append(currentTimeSliceObj)
            timeMergeIndexList[-1].append(i)
            # print(1)
        else:
            # print(nodeChange, linkChang, timeGap)
            timeMergeList.append([currentTimeSliceObj])
            timeMergeIndexList.append([i])
        # i 自加 1，用来循环等待划分的时间片数据
        i += 1
        # print(i, currentTimeSliceObj['sTime'][1])

    # 得到整理后的时间段的数据
    mergedTimeGraphData = dealWithMergeTimeList(gameID, timeMergeList)

    # 构建返回值，要返回划分的状态值
    mergedDataObj = {
        'parentIndexData': timeMergeIndexList,
        'data': mergedTimeGraphData,
        'rawDataSum': len(timeListWaitToDivide),
        'nodeChangeFalseSum': nrFalseSum,
        'linkChangeFalseSum': lrFalseSum,
        'timeGapFalseSum': trFalseSum
    }

    # 返回整理划分好的时间段的数据
    return mergedDataObj


# 按照时间进行均匀分割
def divideSnapshotsByThresholdV5(gameID, timeListWaitToDivide, timeSliceNum):
    timeSliceNum = int(timeSliceNum)
    timeMergeList = []
    timeMergeIndexList = []
    for i in range(len(timeListWaitToDivide)):
        if i % timeSliceNum == 0:
            timeMergeList.append([timeListWaitToDivide[i]])
            timeMergeIndexList.append([i])
        else:
            timeMergeList[-1].append(timeListWaitToDivide[i])
            timeMergeIndexList[-1].append(i)

        # 得到整理后的时间段的数据
    mergedTimeGraphData = dealWithMergeTimeList(gameID, timeMergeList)

    # 构建返回值，要返回划分的状态值
    mergedDataObj = {
        'parentIndexData': timeMergeIndexList,
        'data': mergedTimeGraphData,
        'rawDataSum': len(timeListWaitToDivide),
        'nodeChangeFalseSum': 0,
        'linkChangeFalseSum': 0,
        'timeGapFalseSum': 0
    }

    # 返回整理划分好的时间段的数据
    return mergedDataObj


# 处理已经划分好的时间段
def dealWithMergeTimeList(gameID, timeMergeList):
    # 读取比赛数据, 用来统计数据
    timeDataGraphList = getGameGraphDataInTimeList(gameID=gameID)
    # 处理已经划分好的时间片
    mergedTimeGraphData = []
    # 遍历数据
    # 循环找到每一个时间段
    for timeSegment in timeMergeList:
        firstTimeData = timeSegment[0]
        # 设置这个时间段的数据
        graphObj = {
            # 开始时间，结束时间
            'startTime': firstTimeData['sTime'],
            'endTime': firstTimeData['eTime'],
            # 节点向量
            'nodeVector': firstTimeData['nodeVector'],
            'nodeVectorV2': firstTimeData['nodeVectorV2'],
            # 连接向量
            'linkVector': firstTimeData['linkVector'],
            'linkVectorV2': firstTimeData['linkVectorV2'],
            # 索引
            'indexList': firstTimeData['indexList']
        }
        for i in range(1, len(timeSegment)):
            # 得到时间片数据
            timeSliceData = timeSegment[i]
            # 设置结束时间
            graphObj['endTime'] = timeSliceData['eTime']
            # 设置节点向量
            graphObj['nodeVector'] += timeSliceData['nodeVector']
            graphObj['nodeVectorV2'] += timeSliceData['nodeVectorV2']
            # 设置连接向量
            graphObj['linkVector'] += timeSliceData['linkVector']
            graphObj['linkVectorV2'] += timeSliceData['linkVectorV2']
            # 设置索引序列
            graphObj['indexList'] += timeSliceData['indexList']
        # 整理这个时间段的图数据
        # 节点数据
        graphNodeVector = graphObj['nodeVector']
        graphNodeVectorV2 = graphObj['nodeVectorV2']
        # 连接数据
        graphLinkVector = graphObj['linkVector']
        graphLinkVectorV2 = graphObj['linkVectorV2']
        # 计算节点数量，节点出现次数
        nodeNum = np.float64(graphNodeVector > 0)
        nodeNum = np.linalg.norm(x=nodeNum, ord=1)
        nodeAppearNum = np.linalg.norm(x=graphNodeVectorV2, ord=1)
        # 计算连接数量，连接出现次数
        linkNum = np.float64(graphLinkVector > 0)
        linkNum = np.linalg.norm(x=linkNum, ord=1)
        linkAppearNum = np.linalg.norm(x=graphLinkVectorV2, ord=1)
        # 设置时间段图属性
        graphObj['nodeNum'] = nodeNum
        graphObj['nodeAppearNum'] = nodeAppearNum
        graphObj['linkNum'] = linkNum
        graphObj['linkAppearNum'] = linkAppearNum
        # 删除多余属性
        del graphObj['nodeVector']
        del graphObj['nodeVectorV2']
        del graphObj['linkVector']
        del graphObj['linkVectorV2']

        # 得到这个时间段的统计数据
        nodeSpeedIndicators, linkStableIndicators, linkDistanceIndicators = getGraphState(timeDataGraphList,
                                                                                          graphObj['indexList'])
        graphObj['nodeSpeed'] = nodeSpeedIndicators
        graphObj['linkDistance'] = linkDistanceIndicators
        graphObj['linkStable'] = linkStableIndicators

        # 保存这个时间段的数据
        mergedTimeGraphData.append(graphObj)

    return mergedTimeGraphData


# 处理已经划分好的时间段
def dealWithRawTimeList(gameID, timeMergeList):
    # 读取比赛数据, 用来统计数据
    timeDataGraphList = getGameGraphDataInTimeList(gameID=gameID)
    # 处理已经划分好的时间片
    mergedTimeGraphData = []
    # 遍历数据
    # 循环找到每一个时间段
    for timeSegment in timeMergeList:
        firstTimeData = timeSegment
        # 设置这个时间段的数据
        graphObj = {
            # 开始时间，结束时间
            'startTime': firstTimeData['sTime'],
            'endTime': firstTimeData['eTime'],
            # 节点向量
            'nodeVector': firstTimeData['nodeVector'],
            'nodeVectorV2': firstTimeData['nodeVectorV2'],
            # 连接向量
            'linkVector': firstTimeData['linkVector'],
            'linkVectorV2': firstTimeData['linkVectorV2'],
            # 索引
            'indexList': firstTimeData['indexList']
        }
        # 整理这个时间段的图数据
        # 节点数据
        graphNodeVector = graphObj['nodeVector']
        graphNodeVectorV2 = graphObj['nodeVectorV2']
        # 连接数据
        graphLinkVector = graphObj['linkVector']
        graphLinkVectorV2 = graphObj['linkVectorV2']
        # 计算节点数量，节点出现次数
        nodeNum = np.float64(graphNodeVector > 0)
        nodeNum = np.linalg.norm(x=nodeNum, ord=1)
        nodeAppearNum = np.linalg.norm(x=graphNodeVectorV2, ord=1)
        # 计算连接数量，连接出现次数
        linkNum = np.float64(graphLinkVector > 0)
        linkNum = np.linalg.norm(x=linkNum, ord=1)
        linkAppearNum = np.linalg.norm(x=graphLinkVectorV2, ord=1)
        # 设置时间段图属性
        graphObj['nodeNum'] = nodeNum
        graphObj['nodeAppearNum'] = nodeAppearNum
        graphObj['linkNum'] = linkNum
        graphObj['linkAppearNum'] = linkAppearNum
        # 删除多余属性
        del graphObj['nodeVector']
        del graphObj['nodeVectorV2']
        del graphObj['linkVector']
        del graphObj['linkVectorV2']
        # 得到这个时间段的统计数据
        nodeSpeedIndicators, linkStableIndicators, linkDistanceIndicators = getGraphState(timeDataGraphList,
                                                                                          graphObj['indexList'])
        graphObj['nodeSpeed'] = nodeSpeedIndicators
        graphObj['linkDistance'] = linkDistanceIndicators
        graphObj['linkStable'] = linkStableIndicators

        # 保存这个时间段的数据
        mergedTimeGraphData.append(graphObj)

    return mergedTimeGraphData


# 根据索引得到统计数据
def getGraphState(timeGraphDataList, indexList):
    # 设置节点map和连接map存储节点速度，以及连接距离
    nodeSpeedList = []
    linkStableIndexList = []
    linkDistanceList = []
    # linkMap = {}
    for timeIndex in indexList:
        nodeMap = {}
        timeData = timeGraphDataList[timeIndex]
        # 得到节点数据和连接数据
        nodeList = timeData[-2]
        linkList = timeData[-1]
        # 循环节点数据
        for node in nodeList:
            nodeID = node[1]
            speed = node[5]
            # 跳过球节点
            if id == -1:
                continue
            if nodeID not in nodeMap:
                nodeMap[nodeID] = speed
            # 保存节点的速度
            nodeSpeedList.append(speed)
        # 循环连接数据
        for link in linkList:
            s = link[1]
            t = link[2]
            # 跳过有球的链接
            if s == -1:
                continue
            # 计算连接的速度，应该是连接的熵值，当这个值越大，那么连接约不稳定
            # 连接的速度 * 连接的距离
            # linkStable = (nodeMap[s] + nodeMap[t]) / (link[3] + 0.1)
            linkStable = 1 / math.log(nodeMap[s] + nodeMap[t] + 2) / math.log(link[3] + 2)
            linkStableIndexList.append(linkStable)
            # 保存链接的距离
            linkDistanceList.append(link[3])

    # 计算均值，最大值，最小值
    nodeSpeedMean = np.mean(nodeSpeedList)
    nodeSpeedMax = np.max(nodeSpeedList)
    nodeSpeedMin = np.min(nodeSpeedList)
    # 计算均值，最大值，最小值
    linkStableMean = np.mean(linkStableIndexList)
    linkStableMax = np.max(linkStableIndexList)
    linkStableMin = np.min(linkStableIndexList)
    # 计算均值，最大值，最小值
    linkDistanceMean = np.mean(linkDistanceList)
    linkDistanceMax = np.max(linkDistanceList)
    linkDistanceMin = np.min(linkDistanceList)
    # 返回计算的值，分别是节点统计，
    return [nodeSpeedMin, nodeSpeedMean, nodeSpeedMax], [linkStableMin, linkStableMean, linkStableMax] \
        , [linkDistanceMin, linkDistanceMean, linkDistanceMax]


if __name__ == '__main__':
    # 采样数据 500 条数据
    # sampleData()

    # 读取 时序 图 数据
    # getGameGraphDataInTimeList()
    # 得到 原始 树图
    # test_getRawTreeData()

    # 得到 树图 数据
    # getTreeData()

    # 设计待划分的数据格式
    # getSequenceVector()

    # 均匀划分
    test_getTreeDataByAverageMerge()

    print(1)
