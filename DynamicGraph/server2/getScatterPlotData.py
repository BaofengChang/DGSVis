import json

# 得到 散点图 数据
def getScatterPlotData(gameID='0021500003'):
    file1 = open('/home/cbf/data/basketball/data collection/GameData/gameGraphVector/gameTimeJiangWeiV2_' + gameID + '.json')
    gameTimeData = json.loads(file1.readline())
    file2 = open(
        '/home/cbf/data/basketball/data collection/GameData/gameGraphVector/gameRoundJiangWeiV1_' + gameID + '.json')
    gameRoundData = json.loads(file2.readline())

    result = {
        'timeData': gameTimeData,
        'roundData': gameRoundData
    }


    return result




if __name__ == '__main__':
    pass