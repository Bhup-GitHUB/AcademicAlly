import json

def findEmpty(data):
    blankKeys = []
    for key, value in data.items():
        if value in (None, "", [], {}, ()):
            blankKeys.append(key)

    return blankKeys

def findIdentical(data):
    identicalKeys = []
    for key, value in data.items():
        if value in (value, f"{value}"):
            identicalKeys.append(key)

    return identicalKeys



def main():
    filePath = '../scripts/subjects(TIMETABLEJULYTODEC25).json'
    with open(filePath, 'r', encoding='utf-8') as file:
        data = json.load(file)

    blankKeys = findEmpty(data)
    identicalKeys = findIdentical(data)

    print("blankKeys: ", blankKeys)
    print("identicalKeys: ", identicalKeys)

if __name__ == '__main__':
    main()