import json
import math
import numpy as np


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
    filePath = '/home/cbf/data/basketball/data collection/GameData/playerDataLinkDataTimeData/time_' + gameID + '.json'
    file = open(filePath)
    # 得到 时间顺序 的 数据
    data = json.loads(file.readline())
    data = data['timeList']
    return data


# 计算 时间的差值
def unixTimeDifference(smallUnixTime: int, bigUnixTime: int):
    # 计算两个unix时间的差值
    utDiff = abs(bigUnixTime - smallUnixTime)
    # 除以1000，就是秒
    seconds = utDiff / 1000
    return seconds

# 生成根据拓扑结构生成特征向量，序列形式
def generateTopologyVectorOfGraph(timeGraphData, nodeMap, linkMap):
    # time info--> unix time, period time, round time
    time = [timeGraphData[0], timeGraphData[2], timeGraphData[4]]
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
    nodePositiveNum = len(np.argwhere(nodeVector1))
    linkPositiveNum = len(np.argwhere(linkVector1))
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


# compute time difference
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
        lTimeVector = timeListVectorData[timeMergedList[-1][-1]]
        cTimeVector = timeListVectorData[i]
        # compute the node vector difference and link vector difference
        nodeRelativeChangeIndex, linkRelativeChangeIndex, = computeDifferenceBetweenVector(bTimeVector, cTimeVector)
        nodeRelativeChangeIndex2, linkRelativeChangeIndex2, = computeDifferenceBetweenVector(lTimeVector, cTimeVector)
        # average node difference and link defference
        nChangeIndex = (nodeRelativeChangeIndex + nodeRelativeChangeIndex2) / 2
        lChangeIndex = (linkRelativeChangeIndex + linkRelativeChangeIndex2) / 2
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


# 划分 时间节点
def divideSnapshotsByThresholdV2(gameID='0021500003', nr=1.0, lr=1.0, tr=3.0):
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
        lTimeVector = timeListVectorData[timeMergedList[-1][-1]]
        cTimeVector = timeListVectorData[i]
        # compute the node vector difference and link vector difference
        nodeRelativeChangeIndex, linkRelativeChangeIndex, = computeDifferenceBetweenVector(bTimeVector, cTimeVector)
        # nodeRelativeChangeIndex2, linkRelativeChangeIndex2, = computeDifferenceBetweenVector(lTimeVector, cTimeVector)
        # compute the time difference
        # notice: time gap is computed between the last merged time and current time
        timeGap = computeTimeDifference(timeListGraphData[timeMergedList[-1][-1]], timeListGraphData[i])
        # set merge flag: node merge flag, link merge flag, time merge flag.
        # initial flag value is True
        nodeMergeFlag = True
        linkMergeFlag = True
        timeMergeFlag = True
        # compare change index with threshold, and compute the False number
        if nodeRelativeChangeIndex > nr:
            nodeMergeFlag = False
            nrFalseSum += 1
        if linkRelativeChangeIndex > lr:
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

    return 1


# 划分 时间节点
def divideSnapshotsByThreshold(gameID='0021500003', nr=1.0, lr=1.0, tr=3.0):
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
    # timeListVectorData = []
    # for timeGraph in timeListGraphData:
    #     timeListVectorData.append(generateTopologyVectorOfGraph(timeGraphData=timeGraph, nodeMap=nodeMap, linkMap=linkMap))
    # 时间聚合的结果, 并初始化第一个时间聚合的时间戳
    timeMergedList = [[timeListGraphData[0]]]
    # 遍历时序网络数据
    i = 1
    while i < (len(timeListGraphData)):
        # current time graph & next time graph
        # cTimeGraph = timeListGraphData[i]  # 当前时刻网络数据
        bTimeGraph = timeMergedList[-1][0]  # 从已经聚合的时间片中提取需要对比的时刻网络数据，是已经聚合的时间片

        cTimeGraph = timeListGraphData[i]  # 下一个时刻的网络数据
        # 构建当前时刻的向量，构建下一个时刻的向量
        bTimeVector = generateTopologyVectorOfGraph(timeGraphData=bTimeGraph, nodeMap=nodeMap, linkMap=linkMap)
        cTimeVector = generateTopologyVectorOfGraph(timeGraphData=cTimeGraph, nodeMap=nodeMap, linkMap=linkMap)
        # compute the node vector difference and link vector difference
        nodeRelativeChangeIndex, linkRelativeChangeIndex, = computeDifferenceBetweenVector(bTimeVector, cTimeVector)
        # compute the time difference
        # notice: time gap is computed between the last merged time and current time
        timeGap = computeTimeDifference(timeMergedList[-1][-1], cTimeGraph)
        # set merge flag: node merge flag, link merge flag, time merge flag.
        # initial flag value is True
        nodeMergeFlag = True
        linkMergeFlag = True
        timeMergeFlag = True
        # compare change index with threshold, and compute the False number
        if nodeRelativeChangeIndex > nr:
            nodeMergeFlag = False
            nrFalseSum += 1
        if linkRelativeChangeIndex > lr:
            linkMergeFlag = False
            lrFalseSum += 1
        if timeGap > tr:
            timeMergeFlag = False
            trFalseSum += 1
        # judge whether merge current time into time stamp
        if nodeMergeFlag and linkMergeFlag and timeMergeFlag:
            # todo: merge
            timeMergedList[-1].append(cTimeGraph)
            # print(1)
        else:
            timeMergedList.append([cTimeGraph])
        i += 1

    return 1


# 保存 实验 数据 供可视化使用
def saveDividedResult(gameID, timeListGraphData, timeListMergedIndex, nr, lr, tr):
    nr = str(nr)
    lr = str(lr)
    tr = str(tr)
    filePath = '/home/cbf/data/basketball/data collection/GameData/divide time/divided_V1_' + nr + '_' + lr + '_' + tr + '-' + gameID + '.json'
    file = open(filePath, 'w')
    data = {
        'gameID': gameID,
        'timeListGraphData': timeListGraphData,
        'timeListMergedIndex': timeListMergedIndex
    }
    file.write(json.dumps(data))
    file.flush()
    file.close()
    print('写入文件完毕')


if __name__ == '__main__':
    # # 读取数据
    # data = getNodeAndLinkMap()
    # # 划分数据
    gameID = '0021500003'
    nr = 0.0
    lr = 0.7
    tr = 5.0
    timeListGraphData, timeListMergedIndex = divideSnapshotsByThresholdV3(gameID, nr, lr, tr)
    saveDividedResult(gameID, timeListGraphData, timeListMergedIndex, nr, lr, tr)
    pass
