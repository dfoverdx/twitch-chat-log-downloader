import Axios from 'axios';
import fs from 'fs';
import moment from 'moment';

const vodId = process.argv[process.argv.indexOf('-v') + 1],
    tsFormat = 'YYYY-MM-DD HH:mm:ss';

async function getComments() {
    const filename = (() => {
        let s = process.argv.indexOf('-s'),
            o = process.argv.indexOf('-o');
        return s !== -1 ? null : o === -1 ? `./output-${vodId}.csv` : process.argv[o + 1];
    })();

    let url = `https://api.twitch.tv/v5/videos/${vodId}/comments?content_offset_seconds=0`,
        batch,
        cursor;

    try {
        if (filename) {
            if (fs.existsSync(filename)) {
                fs.unlinkSync(filename);
            }

            fs.appendFileSync(filename, 'VOD timestamp,Message time,Username,Twitch ID,Message,Account create date');
        }

        do {
            batch = (await Axios.get(url, {
                headers: {
                    'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
                    Accept: 'application/vnd.twitchtv.v5+json; charset=UTF-8',
                    'Content-Type': 'application/json; charset=UTF-8',
                }
            })).data;

            const str = batch.comments.map(c => {
                let {
                        created_at: msgCreated,
                        content_offset_seconds: timestamp,
                        commenter: {
                            name,
                            _id,
                            created_at: acctCreated
                        },
                        message: {
                            body: msg
                        }
                    } = c;

                timestamp = moment.duration(timestamp, 'seconds')
                    .toISOString()
                    .replace(/P.*?T(?:(\d+?)H)?(?:(\d+?)M)?(?:(\d+).*?S)?/,
                        (_, ...ms) => {
                            const seg = v => v ? v.padStart(2, '0') : '00';
                            return `${seg(ms[0])}:${seg(ms[1])}:${seg(ms[2])}`;
                        });

                acctCreated = moment(acctCreated).utc();
                msgCreated = moment(msgCreated).utc();
                let line = `${timestamp},${msgCreated.format(tsFormat)},${name},${_id},"${msg.replace(/"/g, '""')}",${acctCreated.format(tsFormat)}`;
                return line;
            }).join('\n');

            if (filename) {
                fs.appendFileSync(filename, '\n' + str);
            } else {
                console.log(str);
            }

            cursor = batch._next;
            url = `https://api.twitch.tv/v5/videos/${vodId}/comments?cursor=${cursor}`;
            await new Promise(res => setTimeout(res, 300));
        } while (cursor);
    } catch (err) {
        console.error(err);
    }
}

getComments();