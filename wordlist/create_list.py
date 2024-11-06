import random

MIN_LENGTH = 4
MAX_LENGTH = 10

NUMBER_DAYS = 5 * 365

with open('basiswoorden-gekeurd.txt', 'r', encoding='utf-8') as wordfile:
    all_words = wordfile.readlines()
    print(f'original list contains {len(all_words)} words')

    dictionary_list = []
    result_list = []
    for word in all_words:
        word = word.strip()
        if word.isalpha() and word.lower() == word:
            # Word is valid for our dictionary
            dictionary_list.append(f'{word}\n')
        if word.isalpha() and word.lower() == word and len(word) >= MIN_LENGTH and len(word) <= MAX_LENGTH:
            # Word is 'fit' for our game
            result_list.append(f'{word}\n')

    # print(result_list)
    print(f'words filtered: {len(result_list)} with length >= {MIN_LENGTH} and <= {MAX_LENGTH}')
    print(f'words in dictionary: {len(dictionary_list)}')

    with open('filtered.txt', 'w', encoding='utf-8') as f:
        f.writelines(result_list)

    with open('dictionary.txt', 'w', encoding='utf-8') as f:
        f.writelines(dictionary_list)

    selection_list = []

    # Randomly select words for each day
    while len(selection_list) < NUMBER_DAYS:
        # Use index - 1 because lists start at index 0
        word_index = random.randrange(0, len(result_list) - 1)
        selection_list.append(result_list[word_index])

    # Save the result
    with open('word_of_the_day.txt', 'w', encoding='utf-8') as f:
        f.writelines(selection_list)

    print(f'done writing {len(selection_list)} random words, enjoy!')
