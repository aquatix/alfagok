"""Main alfagok API application."""
import logging
from datetime import date
from typing import Union

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import DirectoryPath, FilePath
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuration needed for alfagok to find its word list, using environment variables."""

    # Game words
    word_list: FilePath
    # All valid words
    dictionary_list: FilePath
    # Date of first game so we can calculate the game ID we're on
    start_date: date

    static_dir: DirectoryPath = 'static'
    template_dir: DirectoryPath = 'templates'

    debug: bool = False


app = FastAPI()
settings = Settings()
app.mount('/static', StaticFiles(directory=settings.static_dir), name='static')
templates = Jinja2Templates(directory=settings.template_dir)


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
    today = date.today()
    # Calculate the amount of days since the start of the games so we know which word is used today
    return (today - settings.start_date).days


def is_valid_dictionary_word(word: str) -> bool:
    """Verify if `word` is in the dictionary provided."""
    return f'{word}\n' in dictionary


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Generate the main HTML page of the game."""
    language = 'nl'
    return templates.TemplateResponse(request=request, name='index.html', context={'language': language})


@app.get('/api/game')
def what_game():
    """Handle incoming guess."""
    return {'game': get_game_id()}


@app.get('/api/guess')
def handle_guess(word: Union[str, None] = None):
    """Handle incoming guess."""
    current_game_id = get_game_id()
    word_of_the_day = words[current_game_id].strip()

    if not is_valid_dictionary_word(word):
        logger.info('Guess: %s for game %d (%s), word not found in dictionary', word, current_game_id, word_of_the_day)
        return {'error': 'Word not in dictionary'}

    hint = 'it'
    if word_of_the_day < word:
        hint = 'before'
    if word_of_the_day > word:
        hint = 'after'

    logger.info('Guess: %s for game %d (%s), goal is %s', word, current_game_id, word_of_the_day, hint)

    # before, after, it
    return {'game': current_game_id, 'hint': hint}


@app.get("/api/answer/{item_id}")
def read_item(item_id: int, guess: Union[str, None] = None):
    """Get the word item."""
    word = words[item_id].strip()
    return {"item_id": item_id, "guess": guess, 'word': word}
