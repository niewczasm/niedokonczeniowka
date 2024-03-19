
![Logo](https://mniewczas.pl/cards/niedokonczeniowka.png)


# Niedokończeniówka

Prosta gra drag & drop bez wyznaczonego celu. Zabawna. Albo i nie.

Dostępna [tutaj](https://mniewczas.pl/niedokonczeniowka/)

![GIF](https://mniewczas.pl/cards/niedokonczeniowka.gif)




## Podziękowania

 - [Infinity Craft](https://awesomeopensource.com/project/elangosundar/awesome-README-templates) za inspirację do tego stworzenia tego bezczelnego klona


## Zmienne Środowiskowe

Do uruchomienia projektu w pliu .env muszą znaleźć się następujące wpisy (template dostępny w [.env.template](https://github.com/niewczasm/niedokonczeniowka/blob/main/.env.template))

`OPENAI_API_KEY` - klucz API do OpenAI do wygenerowania [tutaj](https://platform.openai.com/api-keys)

`MONGODB_CS` - Connection String do bazy MongoDB

`MONGODB_DB` - Nazwa bazy danych w MongoDB

`MONGODB_CL` - Nazwa kolekcji w MongoDB

## Run Locally

Sklonuj projekt

```bash
  git clone https://github.com/mniewczas/niedokonczeniowka
```

Przejdź do katalogu

```bash
  cd niedokonczeniowka
```

Zainstaluj zależności

```bash
  pip install -r requirements.txt
```

Uruchom serwer

```bash
  flask --app db run --host=0.0.0.0
```

Następnie w przeglądarce wejdź na localhost:5000 i gotowe


## Contributing

Jeżeli widzisz że możesz cokolwiek poprawić lub zrobić lepiej to na co jeszcze czekasz.

Jeżeli widzisz że coś nie działa tak jak powinno to utwórz issue w repozytorium.

Jeżeli wszystko Ci sie podoba i nie chcesz mnie puścić z torbami (requesty do OpenAI swoje kosztują) możesz mnie wspomóc klikając przycisk "Sponsor" na górze strony


## Tech Stack

**Client:** interact.js

**Server:** Python, Flask, MongoDB


## Roadmap

- Przepisać to wszystko by było bardziej czytelne
- Dodać tryb competetive/daily challenge

Kolejność przypadkowa, bardziej plany niż obietnice.

