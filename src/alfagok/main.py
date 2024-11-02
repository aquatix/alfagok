"""Main alfagok API application."""

import logging
from datetime import date
from typing import Union

from fastapi import FastAPI
from pydantic import FilePath
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuration needed for alfagok to find its word list, using environment variables."""

    # Game words
    word_list: FilePath
    # All valid words
    dictionary_list: FilePath
    # Date of first game so we can calculate the game ID we're on
    start_date: date

    debug: bool = False


app = FastAPI()
settings = Settings()

with open(settings.word_list, 'r', encoding='utf-8') as word_file:
    # Load the game words
    words = word_file.readlines()


with open(settings.dictionary_list, 'r', encoding='utf-8') as word_file:
    # Load the list of valid words
    dictionary = word_file.readlines()


logger = logging.getLogger('uvicorn.error')
logger.setLevel(logging.INFO)
if settings.debug:
    logger.setLevel(logging.DEBUG)


def get_game_id():
    """Calculate the index for the game/word we are handling today."""
    print(settings.start_date)
    today = date.today()
    # Calculate the amount of days since the start of the games so we know which word is used today
    return (today - settings.start_date).days


def is_valid_dictionary_word(word: str) -> bool:
    """Verify if `word` is in the dictionary provided."""
    return f'{word}\n' in dictionary


@app.get("/")
def read_root():
    """Ohai."""
    return {"Hello": "World"}


@app.get('/api/guess')
def handle_guess(word: Union[str, None] = None):
    """Handle incoming guess."""
    current_game_id = get_game_id()
    word_of_the_day = words[current_game_id].strip()

    if not is_valid_dictionary_word(word):
        return {'error': 'Word not in dictionary'}

    hint = 'it'
    if word_of_the_day < word:
        hint = 'before'
    if word_of_the_day > word:
        hint = 'after'

    logger.info('Guess: %s for game %d (%s), goal is %s', word, current_game_id, word_of_the_day, hint)

    # before, after, it
    return {'hint': hint}


@app.get("/api/answer/{item_id}")
def read_item(item_id: int, guess: Union[str, None] = None):
    """Get the word item."""
    word = words[item_id].strip()
    return {"item_id": item_id, "guess": guess, 'word': word}
