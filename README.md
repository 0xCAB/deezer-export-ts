# deezer-export-ts

deezer-export-ts is a small tool to export all playlists in a Deezer user's profile.

# Usage

1. Install the dependencies
2. Compile TypeScript
3. Run providing Deezer UserId and a folder path where to download the playlists to.

(Hint: the easiest way to find your Deezer user's id is to log into Deezer and go to your loved songs;
then the browser URL looks something like https://www.deezer.com/profile/[userid]/loved containing your numeric user id.)

```sh
npm install
npm run build
npm run start -- -u <deezer_user_id> -o <output_folder>
```
