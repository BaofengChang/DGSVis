"""DynamicGraph URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf.urls import url

from DynamicGraph.view import index
from DynamicGraph.view import index2
from DynamicGraph.view import test
from DynamicGraph.view import roundHtml
from DynamicGraph.view import lineArea
from DynamicGraph.view import index3
from DynamicGraph.view import index4
from DynamicGraph.view import treeHtml

from DynamicGraph.view import ajaxGetStatisticData
from DynamicGraph.view import ajaxGetGameGraph

from DynamicGraph.view import ajaxGetScatterPlotData
from DynamicGraph.view import ajaxGetPlayerData
from DynamicGraph.view import ajaxGetScoreData
from DynamicGraph.view import ajaxGetRoundData
from DynamicGraph.view import ajaxGetRoundDetails

from DynamicGraph.view import ajaxGetPlayerTimeByID
from DynamicGraph.view import ajaxGetLinkTimeByID
from DynamicGraph.view import ajaxGetPlayerRoundByID

from DynamicGraph.view import ajaxGetTreeData

from DynamicGraph.view import ajaxHelloWorld

from DynamicGraph.view import ajaxTestGetRootTreeData
from DynamicGraph.view import ajaxTestDivideRootTree
from DynamicGraph.view import ajaxTestDivideRootTreeByTimeV2
from DynamicGraph.view import ajaxGetDetails


from DynamicGraph.view import ajaxGetTimeLineData

from DynamicGraph.view import ajaxGetRootTreeData
from DynamicGraph.view import ajaxGetRootTreeDataByTimeRange
from DynamicGraph.view import ajaxGetRootTreeDataByTimeList
from DynamicGraph.view import ajaxDivideTreeByFeature
from DynamicGraph.view import ajaxDivideTreeByTime

from DynamicGraph.view import ajaxGetSnapshotDetails


urlpatterns = [
    path('admin/', admin.site.urls),
    # html 页面
    url('test/', test),
    url('DynamicGraph/', index),
    url('DGVis/', index2),
    url('round/', roundHtml),
    url('lineArea/', lineArea),
    url('DGVis3/', index3),
    url('DGSVis/', index4),

    # ajax 方法
    # 得到 统计 数据
    url('ajax_get_statisticData', ajaxGetStatisticData),
    # 得到 比赛 图
    url('getGameGraph', ajaxGetGameGraph),

    # 得到 散点 图 数据
    url('getPlayerData', ajaxGetPlayerData),
    # 得到 散点 图 数据
    url('getScatterPlotData', ajaxGetScatterPlotData),
    # 得到 比分 图 数据
    url('getScoreData', ajaxGetScoreData),
    # 得到 比分 图 数据
    url('getRoundData', ajaxGetRoundData),
    # 得到 比分 图 数据
    url('getRoundDetails', ajaxGetRoundDetails),

    # 交互
    # 左侧视图 ajax
    url('getPlayerTimeByID', ajaxGetPlayerTimeByID),
    url('getLinkTimeByID', ajaxGetLinkTimeByID),

    # 中上交互
    url('getPlayerRoundByID', ajaxGetPlayerRoundByID),

    # 中下
    # 树图
    url('getTreeData', ajaxGetTreeData),

    url('helloworld', ajaxHelloWorld),


    # 测试 模块
    url('testTree', treeHtml),
    url('ajaxGetRootTree', ajaxTestGetRootTreeData),
    url('ajaxTestDivideRootTree', ajaxTestDivideRootTree),
    url('ajaxDivideRootTreeByTime', ajaxTestDivideRootTreeByTimeV2),
    url('ajaxGetDetails', ajaxGetDetails),
    # url('test', ajaxTestGetTree)

    # 得到时间点数据
    url('getTimeLineData', ajaxGetTimeLineData),

    # 得到树数据
    # url('getRootTreeData', ajaxGetRootTreeData),
    url('getRootTreeByTimeRange', ajaxGetRootTreeDataByTimeRange),
    url('getRootTreeByTimeList', ajaxGetRootTreeDataByTimeList),
    url('ajaxDivideTreeByFeature', ajaxDivideTreeByFeature),
    url('ajaxDivideTreeByTimeGap', ajaxDivideTreeByTime),

    url('ajaxGetSnapshotDetails', ajaxGetSnapshotDetails)

]
