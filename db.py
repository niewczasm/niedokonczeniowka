from openai import OpenAI
from flask import Flask, request, current_app
import json
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__,
            static_url_path='',
            static_folder="web/static",
            )

def  get_db():
    client = MongoClient(os.getenv("MONGODB_CS_test"))
    return client[os.getenv("MONGODB_DB_TEST")]

dbname = get_db()
collection_name = dbname[os.getenv("MONGODB_CL_TEST")]

def askChatGPT(first, second):
    client = OpenAI()
    completion = client.chat.completions.create(
        # model="gpt-3.5-turbo",
        model="gpt-4-turbo-preview",
        temperature=0.7,
        top_p=0.8,
        messages=[
            {"role": "system", "content": "Jesteś w stanie przyjąć dwa hasła i na ich podstawie utworzyć nowe, powiązane z obydwoma. Może to być dowolny rzeczownik lub czasownik, znana osoba, postać fikcyjna, liczebnik, cokolwiek ma logiczny związek. Odpowiadasz zawsze bez tłumaczenia i dodajesz do tego jedną emotikonkę odpowiadającą danemu wynikowi. Nie twórz słów o ile nie jest to konieczne i zwracaj wyniki możliwie po polsku"},
            {"role": "user", "content": f"{first} + {second}"}
        ],
        functions= [{
            "name": "createNewEntry",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "emoji": {
                        "type": "string"
                    }
                },
                "required": ["entry","emoji"]
            }
        }],
        function_call={"name":"createNewEntry"}
    )
    funccall = completion.choices[0].message.function_call
    entry = json.loads(funccall.arguments)
    return entry

def lookForEntry(first, second):
    entry = collection_name.find_one({ "$or": [{ "combinations": {"$in": [[first,second]]} }, { "combinations": {"$in": [[second,first]]}}]})
    if entry is not None:
        print(entry)
        jsonobj = entry
        result = {
            "name": jsonobj['name'],
            "emoji": jsonobj['emoji'],
            "discovered": False
        }
        return result
    else:
        return None

def lookForNewObj(newObj, arr):
    entry = collection_name.find_one({ "name": newObj['name'] })
    if entry is not None:
        entryarr = entry['combinations']
        entryarr.append(arr)
        collection_name.update_one({"name" :entry['name']},{"$set": {"combinations": entryarr}})
        return {
            "name": entry['name'],
            "emoji": entry['emoji'],
            "discovered": False
        }
    else:
        newEntry = {
            "name": newObj['name'],
            "emoji": newObj['emoji'],
            "combinations": [arr]
        }
        collection_name.insert_one(newEntry)
        return {
            "name": newEntry['name'],
            "emoji": newEntry['emoji'],
            "discovered": True
        }

if __name__ == '__main__':
    print("h3h3")
    # i1 = {
    #     "name": "woda",
    #     "emoji": "💧",
    #     "combinations": []
    # }
    # i2 = {
    #     "name": "ogień",
    #     "emoji": "🔥",
    #     "combinations": []
    # }
    # i3 = {
    #     "name": "wiatr",
    #     "emoji": "💨",
    #     "combinations": []
    # }
    # i4 = {
    #     "name": "ziemia",
    #     "emoji": "🌍",
    #     "combinations": []
    # }
    # collection_name.insert_many([i1,i2,i3,i4])
    
@app.route("/generate")
def hello_world():
    first = request.args.get('first')
    second = request.args.get('second')
    result = lookForEntry(first,second)
    if result is not None:
        return result
    else:
        newObj = askChatGPT(first,second)
        return lookForNewObj(newObj,[first,second])
    
@app.route("/")
def serveMain():
    return current_app.send_static_file('index.html')
