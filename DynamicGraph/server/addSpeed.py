import math, json

def addSpeed(gameData):
    """
    计算速度
    :param gameData: 比赛数据
    :return: 比赛数据
    """
    result = ''

    # 平滑数据，让数据事件从开始到结束慢慢
    # timeSeriesData = makeTimeSmooth(gameData['data'])
    data = gameData['data']
    for quarterIndex in range(len(data)):  # 遍历小节
        quarter = data[quarterIndex]  # 得到 小节
        quarterMap = {}  #
        index = -1
        for r in quarter:
            for timeData in r:
                index = index+1
                quarterMap[str(index)] = timeData


        length = len(quarterMap)

        for i in range(length - 1):
            # 得到两个时间的数据
            time1Data = quarterMap[str(i)]
            time2Data = quarterMap[str(i + 1)]
            # 得到两个时间的位置序列
            positionList1 = time1Data[5]
            positionList2 = time2Data[5]
            # 得到时间差
            timeDifference = unixTimeDifference(time1Data[2], time2Data[2])

            # 遍历第一个位置序列
            for m in range(len(positionList1)):
                p1 = positionList1[m]
                speed = 0.0
                speedDirection = [0.0, 0.0]
                # 遍历第二个位置序列，找到同一个人
                for n in range(len(positionList2)):
                    p2 = positionList2[n]
                    if p1[1] == p2[1]:
                        # 找到同一个人，之后计算速度, 终点位置，并跳出循环
                        distance = calculateDistance(p1, p2)
                        speed = round(distance / timeDifference, 2)
                        speedDirection = [p2[2]-p1[2], p2[3]-p1[2]]
                        # break
                # 保存速度，和速度方向
                if speed == 0:
                    p1.append(0.0)  # 速度
                    p1.append(0.0)  # 速度方向 x
                    p1.append(0.0)  # 速度方向 y
                else:
                    p1.append(speed)
                    p1.append(speedDirection[0])
                    p1.append(speedDirection[1])
                # pass

            if i == (length - 2):
                positionList = quarterMap[str(i + 1)][5]
                for p in positionList:
                    p.append(0.0)  # 速度
                    p.append(0.0)  # 速度方向 x
                    p.append(0.0)  # 速度方向 y

        # for i in range(length-1):
        #     # 得到两个时间的数据
        #     time1Data = quarterMap[str(i)]
        #     time2Data = quarterMap[str(i + 1)]
        #     if time1Data[3] < 47:
        #         print(1)
        #     # 得到两个时间的位置序列
        #     positionList1 = time1Data[5]
        #     positionList2 = time2Data[5]
        #     for p1 in positionList1:
        #         if len(p1) < 6:
        #             print(1)


    result = gameData
    return json.loads(json.dumps(result))



def calculateDistance(p1, p2):
    return math.sqrt((p1[2] - p2[2]) * (p1[2] - p2[2]) + (p1[3] - p2[3]) * (p1[3] - p2[3]))



def unixTimeDifference(smallUnixTime: int, bigUnixTime: int):
    # 计算两个unix时间的差值
    utDiff = bigUnixTime - smallUnixTime
    # 除以1000，就是秒
    seconds = utDiff / 1000
    return seconds

def makeTimeSmooth(data):
    """
    处理回合时间是None的数据，在记录的数据中，有一些时间是的回合时间是None值，需要去掉
    :param data:
    :return:
    """
    # 存储数据
    dataTmp = []
    # 将所有的数据进行小节划分
    quarters = []
    for quarterIndex, quarter in enumerate(data):  # 遍历到小节
        quarter = []

    # 返回数据
    return dataTmp