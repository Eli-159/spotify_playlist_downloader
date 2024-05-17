fetch('https://co.wuk.sh/api/json', {
    method: 'POST',
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
        url: encodeURI('https://music.youtube.com/watch?v=TUnEJM6W-Fw&list=RDAMVM4mY9FRxmAwE'),
        aFormat: 'mp3',
        filenamePattern: 'pretty'
    })
}).then(res => res.json()).then(res => {
    if (res.status == 'stream') return fetch(res.url);
    throw Error("Testing Throwing Error");
}).then(res => res.blob()).then(song => {
    const zip = new JSZip();
    const folder = zip.folder('Playlist');
    folder.file("song.mp3", song);
    zip.generateAsync({type:"blob"}).then(content => {
        saveAs(content, "Playist.zip");
    });
}).catch(console.log);