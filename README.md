# dumpleoftheday
dumpleoftheday is an “image of the day” API featuring plushie characters from the instagram account [@dumpleandfriends](https://www.instagram.com/dumpleandfriends/). Give us a follow! ;)

The API is built with Express and uses a MySQL backend. It was deployed with AWS Lambda and API Gateway, and can be called using the base URL https://hbe2i3nu5e.execute-api.us-east-2.amazonaws.com/.

This project was inspired by the [NASA Astronomy Picture of the Day (APOD) API](https://github.com/nasa/apod-api).

## Docs

dumpleoftheday currently has two endpoints, `/imgoftheday` and `/characters`. Additionally, the `/` endpoint should return a welcome message that directs users to here :)

### `/imgoftheday`
When called without any attributes or parameters, the `/imgoftheday` endpoint returns today's image.

Dates are based in the US Central Timezone (ie. the image of the day changes at 12 AM Central). Valid dates range from September 15, 2023 to today's date.

#### Returned Fields

`date` : Date the image is associated with.

`url` : URL to the image.

`image_caption` : Caption for the image.

`characters` : Array of objects containing the `character_id`, `character_name`, and `character_description` fields.

#### Attributes
`date` : String in YYYY-MM-DD format.

#### Query Parameters

Parameters are not to be used with the `date` attribute (they will be ignored).

`start_date` : String in YYYY-MM-DD format. Filters for images in the range from `start_date` to `end_date`. If `end_date` is not specified, it will default to today's date.

`end_date` : String in YYYY-MM-DD format. Filters for images in the range from `start_date` to `end_date`. If `start_date` is not specified, it will default to the earliest valid date (September 15, 2023).

`character` : Positive integer representing the character ID of the character. Filters for images that contain the character(s) from the query parameter. Multiple characters may be included in the query by separating the IDs with a comma.

#### Examples

<details>
<summary>Example: specific date</summary>
<br>
Request
<pre><code>https://hbe2i3nu5e.execute-api.us-east-2.amazonaws.com/imgoftheday/2023-09-16</code></pre>
<br>
Response
<pre>
<code class='language-json'>[
  {
    "date": "2023-09-16",
    "url": "https://dumpleandfriends-pics.s3.us-east-2.amazonaws.com/img_0688.jpg",
    "image_caption": "Willie is a smart, intelligent dolphin who touches grass. Here he's enjoying the sun while reading a book at the park.",
    "characters":
      [
        {"character_id": 2, "character_name": "Willie"}
      ]
  }
]</code>
</pre>
</details>
<br>

<details>
<summary>Example: end_date</summary>
<br>
Request
<pre><code>https://hbe2i3nu5e.execute-api.us-east-2.amazonaws.com/imgoftheday?end_date=2023-09-17</code></pre>
<br>
Response
<pre><code class='language-json'>[
  {
    "date": "2023-09-15",
    "url": "https://dumpleandfriends-pics.s3.us-east-2.amazonaws.com/img_0696.jpg",
    "image_caption": "This is Dumple Senior. He's a fluffy and cute dolphin who likes hugs and meat dumples!",
    "characters":
      [
        {"character_id": 1, "character_name": "Dumple"}
      ]
  },
  {
    "date": "2023-09-16",
    "url": "https://dumpleandfriends-pics.s3.us-east-2.amazonaws.com/img_0688.jpg",
    "image_caption": "Willie is a smart, intelligent dolphin who touches grass. Here he's enjoying the sun while reading a book at the park.",
    "characters":
      [
        {"character_id": 2, "character_name": "Willie"}
      ]
  },
  {
    "date": "2023-09-17",
    "url": "https://dumpleandfriends-pics.s3.us-east-2.amazonaws.com/img_0694.jpg",
    "image_caption": "Siu bang, Jaws, and Willie in deep discussion. What might they be talking about?",
    "characters":
      [
        {"character_id": 2, "character_name": "Willie"},
        {"character_id": 7, "character_name": "Siu Bang"},
        {"character_id": 8, "character_name": "Jaws"}
      ]
  }
]</code></pre>
</details>
<br>

<details>
<summary>Example: multiple parameters</summary>
<br>
Request
<pre><code>https://hbe2i3nu5e.execute-api.us-east-2.amazonaws.com/imgoftheday?start_date=2023-09-17&end_date=2023-09-23&character=2,11</code></pre>
<br>
Response
<pre><code class='language-json'>[
  {
    "date": "2023-09-17",
    "url": "https://dumpleandfriends-pics.s3.us-east-2.amazonaws.com/img_0694.jpg",
    "image_caption": "Siu bang, Jaws, and Willie in deep discussion. What might they be talking about?",
    "characters":
      [
        {"character_id": 2, "character_name": "Willie"},
        {"character_id": 7, "character_name": "Siu Bang"},
        {"character_id": 8, "character_name": "Jaws"}
      ]
  },
  {
    "date": "2023-09-20",
    "url": "https://dumpleandfriends-pics.s3.us-east-2.amazonaws.com/img_0691.jpg",
    "image_caption": "Willie indluges in some cookies :)",
    "characters":
      [
        {"character_id": 2, "character_name": "Willie"}
      ]
  },
  {
    "date": "2023-09-22",
    "url": "https://dumpleandfriends-pics.s3.us-east-2.amazonaws.com/img_0687.jpg",
    "image_caption": "This is Gel, the angel version of Willie. He's a very good boi.",
    "characters":
      [
        {"character_id": 11, "character_name": "Gel"}
      ]
  }
]</code></pre>
</details>
<br>

### `/characters`
Calling this endpoint without any attributes returns an array of all characters that appear in this API. There are no query parameters for this endpoint.

#### Returned Fields
`character_id` : Positive integer ID associated with the character.

`character_name` : Name of the character.

`character_description` : Description of the character.

#### Attributes
`id` : Positive integer representing the character ID.

#### Examples

<details>
<summary>Example: specific character</summary>
<br>
Request
<pre><code>https://hbe2i3nu5e.execute-api.us-east-2.amazonaws.com/characters/1</code></pre>
<br>
Repsonse
<pre><code class='language-json'>[
  {
    "character_id": 1,
    "character_name": "Dumple",
    "character_description": "Dumple (full name Dumple Ling Lee) is a big fluffy dolphin who likes meat dumplings and hugs. He is the first mortal dolphin sent down from heaven and is an ancestor of the Dolphin World royal family."
  }
]</code></pre>
</details>
<br>