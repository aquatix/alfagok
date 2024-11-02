from typing import Union

from fastapi import FastAPI
from pydantic_settings import BaseSettings
from pydantic import FilePath


class Settings(BaseSettings):
    word_list: FilePath


app = FastAPI()
settings = Settings() 


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}
