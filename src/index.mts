import ky from 'ky'
import fs from 'fs'
import { access, constants } from 'node:fs/promises'
import { Command, Option } from 'commander'
import process from 'node:process'

interface PlaylistsResponse {
  data: Array<{
    id: number
    title: string
    nb_tracks: number
  }>
}

interface PlaylistResponse {
  id: number
  title: string
  description: string
  nb_tracks: number
}

const prefix =
  new Date().toISOString().slice(0, 19).replace('T', '-').replaceAll(':', '') +
  '_'

// commandline parsing

const program = new Command()
program
  .name('deezer-export-ts -u userid -o outputfolder')
  .description("Export all your Deezer user's playlists.")
  .version('1.0.0')
  .requiredOption('-u, --user <userid>', 'Deezer account user id')
  .requiredOption(
    '-o, --output <folder>',
    'output folder to write playlist files to',
  )
  .addOption(
    new Option(
      '--max-playlists <limit>',
      'max. number of playlists to download',
    ).default(200),
  )

program.parse(process.argv)

const options = program.opts() as {
  user: string
  output: string
  maxPlaylists: number
}
// console.log('options', options)

// input validation
if (Number.isNaN(Number.parseInt(options.user))) {
  console.error(`Given userid is not numeric: ${options.user}`)
  process.exit()
}
const userId = options.user

try {
  await access(options.output, constants.R_OK | constants.W_OK)
} catch {
  console.error(`Given output directory not writable: ${options.output}`)
  process.exit()
}
const outputFolder = options.output + '/'

// retrieve overall playlists
const playlists: PlaylistsResponse = await ky
  .get(
    `https://api.deezer.com/user/${userId}/playlists?limit=${options.maxPlaylists}`,
  )
  .json()
// console.log(playlists)
console.log(`${playlists.data.length} playlists found for user ${userId}`)

const writeJsonToFile = (json: string, filename: fs.PathOrFileDescriptor) => {
  fs.writeFile(filename, json, (err) => {
    if (err) {
      console.log('Error writing file:', err)
    } else {
      console.log(`Successfully exported: ${filename}`)
    }
  })
}

writeJsonToFile(
  JSON.stringify(playlists, null, '\t'),
  outputFolder + prefix + 'playlists.json',
)

// retrieve detailed playlists
for (let i = 0; i < playlists.data.length; i++) {
  const playlist = playlists.data[i]
  console.log(
    `Exporting playlist ${i + 1} of ${playlists.data.length} - ${playlist.id} ${playlist.title}`,
  )
  // using number of tracks info as limit to retrieve all tracks, otherwise Deezer would cut them off
  const maxNumberOfTracks = playlist.nb_tracks + 1
  const fullPlaylist: PlaylistResponse = await ky
    .get(
      `https://api.deezer.com/playlist/${playlist.id}?limit=${maxNumberOfTracks}`,
    )
    .json()

  writeJsonToFile(
    JSON.stringify(fullPlaylist, null, '\t'),
    outputFolder + prefix + 'playlist-' + playlist.id + '.json',
  )
}
