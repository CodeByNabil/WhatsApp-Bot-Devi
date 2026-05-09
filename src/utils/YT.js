import { createWriteStream, promises } from 'fs'
import { Innertube, UniversalCache, Utils as YTUtils } from 'youtubei.js'
import { tmpdir } from 'os'
import Utils from './Util.js'
const { unlink, readFile } = promises
export default class YT {
    constructor(url, type) {
        this.url = url
        this.type = type // 'audio' or 'video'
        this.id = this.parseId()
    }

    validateURL = () => {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/
        return regex.test(this.url)
    }

    getInfo = async () => {
        const YT = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true })
        const info = await YT.getInfo(this.id)
        return {
            videoDetails: {
                title: info.basic_info.title,
                author: { name: info.basic_info.author },
                lengthSeconds: info.basic_info.duration,
                thumbnails: info.basic_info.thumbnail
            }
        }
    }

    getBuffer = async () => {
        try {
            const YT = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true })
            if (this.type == 'audio') {
                const filename = `${tmpdir()}/${Math.random().toString(36)}.mp3`
                const stream = createWriteStream(filename)
                for await (const chunk of YTUtils.streamToIterable(
                    await YT.download(this.id, {
                        type: 'audio',
                        quality: 'best',
                        format: 'mp4',
                        client: 'YTSTUDIO_ANDROID'
                    })
                )) {
                    stream.write(chunk)
                }

                stream.end()
                const buffer = await readFile(filename)
                await unlink(filename)
                return buffer
            }

            const audioFilename = `${tmpdir()}/${Math.random().toString(36)}.mp3`
            const videoFilename = `${tmpdir()}/${Math.random().toString(36)}.mp4`
            const filename = `${tmpdir()}/${Math.random().toString(36)}.mp4`
            const audioStream = createWriteStream(audioFilename)
            const videoStream = createWriteStream(videoFilename)

            for await (const chunk of YTUtils.streamToIterable(
                await YT.download(this.id, {
                    type: 'audio',
                    quality: 'best',
                    format: 'mp4',
                    client: 'YTSTUDIO_ANDROID'
                })
            )) {
                audioStream.write(chunk)
            }
            audioStream.end()

            for await (const chunk of YTUtils.streamToIterable(
                await YT.download(this.id, {
                    type: 'video',
                    quality: 'best',
                    format: 'mp4',
                    client: 'YTSTUDIO_ANDROID'
                })
            )) {
                videoStream.write(chunk)
            }
            videoStream.end()

            await this.utils.exec(`ffmpeg -i ${videoFilename} -i ${audioFilename} -c:v copy -c:a aac ${filename}`)
            const buffer = await readFile(filename)
            Promise.all([unlink(videoFilename), unlink(audioFilename), unlink(filename)])
            return buffer
        } catch (error) {
            console.error(error)
        }
    }

    get thumbnail() {
        return `https://i.ytimg.com/vi/${this.id}/hqdefault.jpg`
    }

    getThumbnail = async () => {
        return await this.utils.fetchBuffer(this.thumbnail)
    }

    parseId = () => {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/
        const match = this.url.match(regex)
        if (match) {
            const id = match[1].split('&')[0]
            return id
        }
        return this.url
    }

    utils = new Utils()
}
