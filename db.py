from openai import OpenAI
from flask import Flask, request, current_app, abort
import json
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import logging

load_dotenv()

logging.basicConfig(filename='logs.log', level=logging.WARN)
app = Flask(__name__,
            static_url_path='',
            static_folder="web/static",
            )

def  get_db():
    client = MongoClient(os.getenv("MONGODB_CS"))
    return client[os.getenv("MONGODB_DB")]

dbname = get_db()
collection_name = dbname[os.getenv("MONGODB_CL")]

def askChatGPT(first, second):
    client = OpenAI()
    completion = client.chat.completions.create(
        model="gpt-4-turbo-preview",
        temperature=1,
        top_p=0.1,
        messages=[
            {"role": "system", "content": "Przyjmujesz dwa hasła i na ich podstawie tworzysz nowe, powiązane hasło. Może to być rzeczownik, osoba, postać fikcyjna, cokolwiek co ma logiczny związek. Nie twórz słów o ile nie jest to konieczne i zwracaj wyniki po polsku, liczebniki i liczby zapisane słownie zamieniaj na liczby. Każdy wyraz pisz z wielkiej litery, o ile nie jest to nazwa własna"},
            {"role": "user", "content": f"{first} + {second}"}
        ],
        functions= [{
            "name": "createNewEntry",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "nowe hasło wynikające z haseł podanych przez uzytkownika"
                    },
                    "emoji": {
                        "type": "string",
                        "description":"pojedyncze emoji reprezentujące hasło z pola name"
                    }
                },
                "required": ["name","emoji"]
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
    i1 = {
        "name": "Woda",
        "emoji": "💧",
        "combinations": []
    }
    i2 = {
        "name": "Ogień",
        "emoji": "🔥",
        "combinations": []
    }
    i3 = {
        "name": "Wiatr",
        "emoji": "💨",
        "combinations": []
    }
    i4 = {
        "name": "Ziemia",
        "emoji": "🌍",
        "combinations": []
    }
    collection_name.insert_many([i1,i2,i3,i4])    

@app.route("/generate")
def hello_world():
    first = request.args.get('first')
    second = request.args.get('second')
    result = lookForEntry(first,second)
    if result is not None:
        return result
    else:
        newObj = {}
        firstTime = True
        while 'name' not in newObj or 'emoji' not in newObj:
            if not firstTime:
                app.logger.critical(f"Error while generating new entry:  {first} {second} {newObj}, retrying")        
            newObj = askChatGPT(first,second)
            firstTime = False
        return lookForNewObj(newObj,[first,second])
    
@app.route("/")
def serveMain():
    return current_app.send_static_file('index.html')    