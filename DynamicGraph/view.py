import sys
# sys.path.append('/home/cbf/project/DynamicGraph/DynamicGraph')  # 相当于

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from DynamicGraph.server2.getTimeLineData import getTimeLineData
from test.test_sever import a

# from back_end.get_data import getStaticsData

# 测试
from DynamicGraph.server.test import returnInfo

# 服务

from DynamicGraph.server.getData import getStatisticData
from DynamicGraph.server.getData import getGameNetwork
from DynamicGraph.server2.ajaxGetServer import ajaxGraphData


from DynamicGraph.server2.getScatterPlotData import getScatterPlotData
from DynamicGraph.server2.getPlayerData import getPlayerData
from DynamicGraph.server2.getScoreData import getScoreData
from DynamicGraph.server2.getRoundData import getRoundData
from DynamicGraph.server2.getRoundDetailData import getRoundDetailsData


from DynamicGraph.server2.getPlayerTime import getPlayerTimeByID
from DynamicGraph.server2.getPlayerTime import getLinkTimeByID
from DynamicGraph.server2.getPlayerTime import getPlayerRoundByID


from DynamicGraph.server2.getTreeData import getTreeData

from DynamicGraph.divideTree.getTreeDataTest import test_getRawTreeData
from DynamicGraph.divideTree.getTreeDataTest import test_getTreeData
from DynamicGraph.divideTree.getTreeDataTest import test_getTreeDataByAverageMerge

from DynamicGraph.divideTree.getDetails import getDetails

from DynamicGraph.server2.getTreeData import getRootTreeData
from DynamicGraph.server2.getTreeData import getRootTreeDataByTimeRange
from DynamicGraph.server2.getTreeData import getRootTreeDataByTimeList
from DynamicGraph.server2.getTreeData import getTreeDataV2
from DynamicGraph.server2.getTreeData import getTreeDataV3
from DynamicGraph.server2.getTreeData import getTreeDataByAverageMerge
from DynamicGraph.server2.getTreeData import getTreeDataByAverageMergeV2

from DynamicGraph.server2.getSnapshotDetails import getSnapshotDetails




def test(request):
    return render(request, 'test.html')  # 系统视图


def index(request):
    return render(request, 'index.html')  # 系统视图


def index2(request):
    return render(request, 'indexV2.html')  # 系统视图

def index4(request):
    return render(request, 'indexV4.html')  # 系统视图

def index3(request):
    return render(request, 'indexV3.html')  # 系统视图

def roundHtml(request):
    return render(request, 'round.html')  # 测试 回合 视图

def lineArea(request):
    return render(request, 'lineArea.html')  # 测试 回合 视图


# 获取比赛的统计数据
def ajaxGetStatisticData(request):
    """
    获取比赛的统计数据
    :param request:
    :return:
    """
    print('比赛数据')
    statisticData = getStatisticData()
    return JsonResponse(statisticData, safe=False)





def ajaxGetScatterPlotData(request):
    """
    获取 比赛 散点图 数据
    :param request:
    :return:
    """
    print('比赛数据')
    gameID = request.GET['gameID']
    statisticData = getScatterPlotData(gameID=gameID)
    return JsonResponse(statisticData, safe=False)


def ajaxGetPlayerData(request):
    """
    获取 比赛 散点图 数据
    :param request:
    :return:
    """
    print('比赛数据')
    gameID = request.GET['gameID']
    statisticData = getPlayerData(gameID=gameID)
    return JsonResponse(statisticData, safe=False)


def ajaxGetScoreData(request):
    """
    获取 比赛 散点图 数据
    :param request:
    :return:
    """
    print('比赛数据')
    gameID = request.GET['gameID']
    statisticData = getScoreData(gameID=gameID)
    return JsonResponse(statisticData, safe=False)


def ajaxGetRoundData(request):
    """
    获取 比赛 散点图 数据
    :param request:
    :return:
    """
    print('比赛数据')
    gameID = request.GET['gameID']
    statisticData = getRoundData(gameID=gameID)
    return JsonResponse(statisticData, safe=False)



def ajaxGetRoundDetails(request):
    """
        获取 比赛 散点图 数据
        :param request:
        :return:
        """
    print('回合细节数据')
    gameID = request.GET['gameID']  # str 格式
    roundSelection = request.GET['roundSelection']
    linkType = request.GET['linkType']
    print(gameID, roundSelection, type(roundSelection))
    statisticData = getRoundDetailsData(gameID=gameID, roundSelection=roundSelection, linkType=linkType)
    return JsonResponse(statisticData, safe=False)






def ajaxGetGameGraph(request):
    """
    获取 比赛 图
    :param request:
    :return:
    """
    print('比赛图数据')
    gameID = request.GET['gameID']  # 比赛 ID
    kThreshold = int(request.GET['kThreshold'])  # knn 参数
    disThreshold = float(request.GET['disThreshold'])  # dis 距离参数
    data = 'game graph'
    # result = getGameNetwork(gameID, disThreshold=disThreshold, kThreshold=kThreshold)
    data = ajaxGraphData(gameID=gameID)
    # data['dataDescription'] = 'game graph'
    return JsonResponse(data, safe=False)

# 得到 球员 出现的 时间
def ajaxGetPlayerTimeByID(request):
    print("按照球员id查找球员出现的时间")
    gameID = request.GET['gameID']  # 比赛 ID
    playerID = request.GET['playerid']  # 球员 id
    data = getPlayerTimeByID(gameID, playerID)
    return JsonResponse(data, safe=False)

# 得到 连接 出现的 时间
def ajaxGetLinkTimeByID(request):
    print("按照连接id查找球员出现的时间")
    gameID = request.GET['gameID']  # 比赛 ID
    sid = request.GET['sid']  # 球员 id
    tid = request.GET['tid']  # 球员 id
    data = getLinkTimeByID(gameID, sid, tid)
    return JsonResponse(data, safe=False)

# 得到 球员 出现 的 回合
def ajaxGetPlayerRoundByID(request):
    print("按照球员id查找球员出现的回合")
    gameID = request.GET['gameID']  # 比赛 ID
    playerID = request.GET['playerid'].split('-')[-1]  # 球员 id
    data = getPlayerRoundByID(gameID, playerID)
    return JsonResponse(data, safe=False)

#  得到 树图 数据
def ajaxGetTreeData(request):
    print('获取树图的数据')
    gameID = request.GET['gameID']  # 比赛 ID
    data = getTreeData(gameID)
    return JsonResponse(data, safe=False)


# 得到 小节 视图
def ajaxGetQuarterGraph(request):
    """
    获取 比赛 小节 图
    :param request:
    :return:
    """
    gameID = request.GET['gameID']  # 比赛 ID
    kThreshold = request.GET['kThreshold']  # knn 参数
    disThreshold = request.GET['disThreshold']  # dis 距离参数
    result = 'game quarter graph'

    return JsonResponse(result, safe=False)


# 得到 回合 图
def ajaxGetRoundGraph(request):
    """
    获取 比赛 回合 图
    :param request:
    :return:
    """
    gameID = request.GET['gameID']  # 比赛 ID
    kThreshold = request.GET['kThreshold']  # knn 参数
    disThreshold = request.GET['disThreshold']  # dis 距离参数


def ajaxHelloWorld(request):
    helloWorld = returnInfo()
    return JsonResponse(helloWorld, safe=False)



def ajaxTestGetRootTreeData(request):
    gameID = request.GET['gameID']  # 比赛 ID
    data = test_getRawTreeData(gameID)
    return JsonResponse(data, safe=False)



# 按照权重划分数
def ajaxTestDivideRootTree(request):
    gameID = request.GET['gameID']  # 比赛 ID
    zoneDivided = request.GET['zoneDivided']  # 分区
    if zoneDivided == '0':
        zoneDivided = None
    print(gameID, zoneDivided)
    nodeChangeThreshold = float(request.GET['nodeChangeThreshold']) / 100
    linkChangeThreshold = float(request.GET['linkChangeThreshold']) / 100
    timeGapThreshold = float(request.GET['timeGapThreshold'])
    brushedStartIndex = request.GET['brushedStartIndex']
    brushedEndIndex = request.GET['brushedEndIndex']
    data = ''
    if brushedStartIndex != '':
        brushedStartIndex = int(brushedStartIndex)
        brushedEndIndex = int(brushedEndIndex)
        print(nodeChangeThreshold, linkChangeThreshold, timeGapThreshold, brushedStartIndex, brushedStartIndex)
        data = test_getTreeData(gameID, zoneDivided, nodeChangeThreshold, linkChangeThreshold, timeGapThreshold, brushedStartIndex, brushedEndIndex)
    else:
        data = test_getTreeData(gameID, zoneDivided, nodeChangeThreshold, linkChangeThreshold, timeGapThreshold,
                                None, None)
    return JsonResponse(data, safe=False)







# 按照时间划分树，平均划分树
def ajaxTestDivideRootTreeByTimeV2(request):
    gameID = request.GET['gameID']  # 比赛 ID
    zoneDivided = request.GET['zoneDivided']  # 分区
    if zoneDivided == '0':
        zoneDivided = None
    timeSliceNum = request.GET['timeSliceNum']  # 时间跨度
    # data = test_getTreeDataByAverageMerge(gameID, zoneDivided, timeSliceNum)
    brushedStartIndex = request.GET['brushedStartIndex']
    brushedEndIndex = request.GET['brushedEndIndex']
    data = ''
    if brushedStartIndex != '':
        brushedStartIndex = int(brushedStartIndex)
        brushedEndIndex = int(brushedEndIndex)
        print(timeSliceNum, brushedStartIndex, brushedStartIndex)
        data = test_getTreeDataByAverageMerge(gameID, zoneDivided, timeSliceNum,
                                brushedStartIndex, brushedEndIndex)
    else:
        data = test_getTreeDataByAverageMerge(gameID, zoneDivided, timeSliceNum,
                                None, None)
    return JsonResponse(data, safe=False)



# 按照时间划分树，平均划分树
def ajaxTestDivideRootTreeByTimeV2(request):
    gameID = request.GET['gameID']  # 比赛 ID
    zoneDivided = request.GET['zoneDivided']  # 分区
    if zoneDivided == '0':
        zoneDivided = None
    timeSliceNum = request.GET['timeSliceNum']  # 时间跨度
    # data = test_getTreeDataByAverageMerge(gameID, zoneDivided, timeSliceNum)
    brushedStartIndex = request.GET['brushedStartIndex']
    brushedEndIndex = request.GET['brushedEndIndex']
    data = ''
    if brushedStartIndex != '':
        brushedStartIndex = int(brushedStartIndex)
        brushedEndIndex = int(brushedEndIndex)
        print(timeSliceNum, brushedStartIndex, brushedStartIndex)
        data = test_getTreeDataByAverageMerge(gameID, zoneDivided, timeSliceNum,
                                brushedStartIndex, brushedEndIndex)
    else:
        data = test_getTreeDataByAverageMerge(gameID, zoneDivided, timeSliceNum,
                                None, None)
    return JsonResponse(data, safe=False)



#  得到根节点信息
def ajaxGetRootTreeData(request):
    gameID = request.GET['gameID']  # 比赛 ID
    selectRange = request.GET['range']
    data = getRootTreeData(gameID, selectRange)
    return JsonResponse(data, safe=False)


def ajaxGetRootTreeDataByTimeRange(request):
    gameID = request.GET['gameID']  # 比赛 ID
    # selectRange = request.GET['range']
    stime = float(request.GET['startTime'])
    etime = float(request.GET['endTime'])
    print(stime, etime)
    data = getRootTreeDataByTimeRange(gameID, stime, etime)
    return JsonResponse(data, safe=False)


def ajaxGetRootTreeDataByTimeList(request):
    gameID = request.GET['gameID']  # 比赛 ID
    # selectRange = request.GET['range']
    timeList = request.GET['timeList']
    print(timeList)
    data = getRootTreeDataByTimeList(gameID, timeList)
    return JsonResponse(data, safe=False)



# 根据特征划分树
def ajaxDivideTreeByFeature(request):
    gameID = request.GET['gameID']  # 比赛 ID
    zoneDivided = request.GET['zoneDivided']  # 分区
    if zoneDivided == '0':
        zoneDivided = None
    print(gameID, zoneDivided)
    nodeChangeThreshold = float(request.GET['nodeChangeThreshold']) / 100
    linkChangeThreshold = float(request.GET['linkChangeThreshold']) / 100
    timeGapThreshold = float(request.GET['timeGapThreshold'])
    # 得到树里有哪些索引
    brushedIndexList = request.GET['brushedIndex']
    brushedStartIndex = request.GET['brushedStartIndex']
    brushedEndIndex = request.GET['brushedEndIndex']
    data = ''
    # if brushedStartIndex != '':
    #     brushedStartIndex = int(brushedStartIndex)
    #     brushedEndIndex = int(brushedEndIndex)
    #     print('根据特征划分树', nodeChangeThreshold, linkChangeThreshold, timeGapThreshold, brushedStartIndex, brushedStartIndex)
    #     data = getTreeDataV2(gameID, zoneDivided, nodeChangeThreshold, linkChangeThreshold, timeGapThreshold,
    #                             brushedStartIndex, brushedEndIndex)
    # else:
    #     data = getTreeDataV2(gameID, zoneDivided, nodeChangeThreshold, linkChangeThreshold, timeGapThreshold,
    #                             None, None)
    print('根据特征划分树')
    print(brushedIndexList)
    data = getTreeDataV3(gameID, zoneDivided, nodeChangeThreshold, linkChangeThreshold, timeGapThreshold, brushedIndexList)







    return JsonResponse(data, safe=False)


# 根据时间划分树
def ajaxDivideTreeByTime(request):
    gameID = request.GET['gameID']  # 比赛 ID
    zoneDivided = request.GET['zoneDivided']  # 分区
    if zoneDivided == '0':
        zoneDivided = None
    timeSliceNum = request.GET['timeSliceNum']  # 时间跨度
    # data = test_getTreeDataByAverageMerge(gameID, zoneDivided, timeSliceNum)
    brushedStartIndex = request.GET['brushedStartIndex']
    brushedEndIndex = request.GET['brushedEndIndex']
    brushedIndexList = request.GET['brushedIndex']
    data = ''
    # if brushedStartIndex != '':
    #     brushedStartIndex = int(brushedStartIndex)
    #     brushedEndIndex = int(brushedEndIndex)
    #     print(timeSliceNum, brushedStartIndex, brushedStartIndex)
    #     data = getTreeDataByAverageMerge(gameID, zoneDivided, timeSliceNum,
    #                             brushedStartIndex, brushedEndIndex)
    # else:
    #     data = getTreeDataByAverageMerge(gameID, zoneDivided, timeSliceNum,
    #                             None, None)
    data = getTreeDataByAverageMergeV2(gameID, zoneDivided, timeSliceNum, brushedIndexList)
    return JsonResponse(data, safe=False)



# 根军选中的时间片得到细节信息
def ajaxGetDetails(request):
    # 得到参数
    gameID = request.GET['gameID']  # 比赛 ID
    timeDataIndexList = request.GET['timeDataIndexList']  # 分区
    # 得到数据
    data = ''
    data = getDetails(gameID, timeDataIndexList)
    return JsonResponse(data, safe=False)

def ajaxGetSnapshotDetails(request):
    # 得到参数
    gameID = request.GET['gameID']  # 比赛 ID
    timeDataIndexList = request.GET['timeDataIndexList']  # 分区
    # 得到数据
    data = ''
    data = getSnapshotDetails(gameID, timeDataIndexList)
    return JsonResponse(data, safe=False)


# 得到时间片数据
def ajaxGetTimeLineData(request):
    # 得到参数
    gameID = request.GET['gameID']  # 比赛 ID
    # 得到数据
    data = getTimeLineData(gameID)
    return JsonResponse(data, safe=False)





def treeHtml(request):
    return render(request, 'dividedTree.html')



if __name__ == '__main__':
    r = {

    }
    ajaxGetQuarterGraph(r)
