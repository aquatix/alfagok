import random

MIN_LENGTH = 4
MAX_LENGTH = 10

NUMBER_DAYS = 5 * 365

# Set to True if you want to use the big but difficult OpenTaal list
USE_OPENTAAL = False

with open('wikiwoordenboek_basiswoorden.lst', 'r', encoding='utf-8') as wordfile:
    wikiwoorden_words = wordfile.readlines()
    print(f'wikiwoorden basic list contains {len(wikiwoorden_words)} words')

with open('basiswoorden-gekeurd.txt', 'r', encoding='utf-8') as wordfile:
    basis_words = wordfile.readlines()
    print(f'opentaal basic list contains {len(basis_words)} words')

with open('flexies-ongekeurd.txt', 'r', encoding='utf-8') as wordfile:
    # Vervoegingen and such, see https://nl.wikipedia.org/wiki/Flexie_(taalkunde)
    flexies_words = wordfile.readlines()
    print(f'flexies list contains {len(flexies_words)} words')

with open('/usr/share/dict/american-english', 'r', encoding='utf-8') as wordfile:
    # English words we want to filter from the list; don't really care if there's accidental overlap with Dutch words
    english_words = wordfile.readlines()
    print(f'english list contains {len(english_words)} words')

print()
print('merging and filtering...')
print()

all_words_count = 0
dictionary_list = []
result_list = []
for word in wikiwoorden_words + basis_words + flexies_words:
    all_words_count += 1
    word = word.strip()
    if word.isalpha() and word.lower() == word:
        # Word is valid for our dictionary
        dictionary_list.append(f'{word}\n')

# Deduplicate dictionary
dictionary_list = sorted(list(set(dictionary_list)), key=str.casefold)

if USE_OPENTAAL:
    # Use basis_words if you want to use the big but difficult OpenTaal list
    source_words = basis_words
else:
    source_words = wikiwoorden_words

for word in source_words:
    word = word.strip()
    if word.isalpha() and word.lower() == word and len(word) >= MIN_LENGTH and len(word) <= MAX_LENGTH:
        # Word is 'fit' for our game
        result_list.append(f'{word}\n')

if USE_OPENTAAL:
    nl_set = set(result_list)
    en_set = set(english_words)

    # Only keep the words that are not found in the English set
    filtered_set = nl_set.difference(en_set)
    filtered_list = sorted(list(filtered_set), key=str.casefold)
else:
    filtered_list = sorted(list(wikiwoorden_words), key=str.casefold)

print(f'words total: {all_words_count}')
print(f'words in dictionary: {len(dictionary_list)}')
print(f'words initially filtered: {len(result_list)} with length >= {MIN_LENGTH} and <= {MAX_LENGTH}')
if USE_OPENTAAL:
    print(f'words after filtering english: {len(filtered_list)}')

with open('filtered.txt', 'w', encoding='utf-8') as f:
    f.writelines(filtered_list)

with open('dictionary.txt', 'w', encoding='utf-8') as f:
    f.writelines(dictionary_list)

selection_list = []

# Randomly select words for each day
while len(selection_list) < NUMBER_DAYS:
    # Use index - 1 because lists start at index 0
    word_index = random.randrange(0, len(filtered_list) - 1)
    selection_list.append(filtered_list[word_index])

# Save the result
with open('word_of_the_day.txt', 'w', encoding='utf-8') as f:
    f.writelines(selection_list)

print(f'done writing {len(selection_list)} random words, enjoy!')
