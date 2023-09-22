# dumpleoftheday
dumpleoftheday is an “image of the day” API featuring plushie characters from the instagram account [@dumpleandfriends](https://www.instagram.com/dumpleandfriends/). Give us a follow! ;)

The API is built with Express and uses a MySQL backend. It was deployed with AWS Lambda and API Gateway, and can be called using the base URL (TODO ADD URL HERE).

This project was inspired by the [NASA Astronomy Picture of the Day (APOD) API](https://github.com/nasa/apod-api).

## Docs

dumpleoftheday currently has two endpoints, `/imgoftheday` and `/characters`. Additionally, the `/` endpoint should return a welcome message that directs users to here :)

### `/imgoftheday`
When called without any attributes or parameters, the `/imgoftheday` endpoint returns today's image.

Dates are based in the US Central Timezone. Valid dates range from September 15, 2023 to today's date.

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

`character` : Positive integer representing the character ID of the character to include in the query. Filters for images that contain the character(s) from the query parameter. Multiple characters may be included in the query by separating the IDs with a comma.

#### Examples

<details>
<summary>Example: specific date</summary>
<br>
Request
<pre>request</pre>
<br>
Return
<pre>response</pre>
</details>
<br>

<details>
<summary>Example: end_date</summary>
<br>
Request
<pre>request</pre>
<br>
Return
<pre>response</pre>
</details>
<br>

<details>
<summary>Example: character</summary>
<br>
Request
<pre>request</pre>
<br>
Return
<pre>response</pre>
</details>
<br>

<details>
<summary>Example: multiple parameters</summary>
<br>
Request
<pre>request</pre>
<br>
Return
<pre>response</pre>
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
<pre>request</pre>
<br>
Return
<pre>response</pre>
</details>
<br>