import json

# 读取 默认情况线下的 网络数据
def readDefaultNetworks(gameID):
    result = ''
    filePath = '/home/cbf/data/basketball/data collection/position with networks t1k1/' + gameID + '.json'   # 读取文件路径
    file = open(filePath, 'r')  # 打开 默认的 网络 文件
    content = file.readline()  # 读取 文件内容
    gameData = json.loads(content)  # 转化 json/dict 格式
    result = gameData
    return result  # 返回数据


# 读取比赛 位置数据
def readGamePositionData(gameID):
    result = ''
    filePath = '/home/cbf/data/basketball/data collection/gamePositionData/' + gameID + '.json'  # 读取文件路径
    file = open(filePath, 'r')  # 打开 比赛位置数据 文件
    content = file.readline()  # 读取 文件内容
    gameData = json.loads(content)  # 转化 json/dict 格式
    result = gameData
    return result

