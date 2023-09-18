# dumpleoftheday
dumpleoftheday is an “image of the day” API featuring plushie characters from the instagram account [@dumpleandfriends](https://www.instagram.com/dumpleandfriends/). Give us a follow! ;)

This API was inspired by the [NASA Astronomy Picture of the Day (APOD) API](https://github.com/nasa/apod-api).

## Docs

dumpleoftheday only processes GET requests. It currently has two endpoints, `/imgoftheday` and `/characters`.

### `/imgoftheday`
When called without any attributes or parameters, the `/imgoftheday` endpoint returns today's image.

Dates are based in the US Central timezone. Valid dates range from September 15, 2023 to today's date.

#### Returned Fields

`date` : Date the image is associated with.

`url` : URL to the image.

`image_caption` : Caption relating to the image.

`characters` : Array of objects containing the `character_id`, `character_name`, and `character_description` fields.

#### Attributes
`date` : String in YYYY-MM-DD format.

#### Query Parameters

Parameters are not to be used with the `date` attribute.

`start_date` : String in YYYY-MM-DD format. All images in the range from `start_date` to `end_date` will be returned. If `end_date` is not specified, it will default to today's date.

<details>
<summary>Example: start_date</summary>
<br>
Request
<pre>request</pre>
<br>
Return
<pre>response</pre>
</details>
<br>

`end_date` : String in YYYY-MM-DD format. All images in the range from `start_date` to `end_date` will be returned. If `start_date` is not specified, it will default to the earliest valid date (September 15, 2023).

`character` : Positive integer representing the character ID of the character to include in the query. Multiple characters may be included in the query by separating the IDs with a comma.


### `/characters`
Calling this endpoint without any attributes returns an array of all characters that appear in this API.

#### Returned Fields
`character_id` : Positive integer ID associated with the character.

`character_name` : Name of the character.

`character_description` : Description of the character.

#### Attributes
`id` : Positive integer representing the character ID.
