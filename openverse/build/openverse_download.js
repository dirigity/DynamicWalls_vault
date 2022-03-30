const fs = require("fs");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
function getPageRequest(n) {
    return `https://api.openverse.engineering/v1/images/?` +
        `q=wallpaper&` +
        `license_type=commercial&` +
        `license=cc0,pdm,by,by-sa,by-nd&` +
        `aspect_ratio=wide&` +
        `page=${n}`
}

function time(t) {
    return new Promise((r) => {
        setTimeout(r, t * 1000);
    })
}

(async () => {

    let i = 45;

    while (true) {
        let sofar = JSON.parse(fs.readFileSync("openverse.json"));
        const response = await fetch(getPageRequest(i));
        const data = await response.json();

        console.log(data);
        i++;
        fs.writeFileSync("openverse.json", JSON.stringify([...sofar, ...data.results]))

        var stats = fs.statSync("openverse.json")
        var fileSizeInBytes = stats["size"]
        //Convert the file size to megabytes (optional)
        var fileSizeInMegabytes = fileSizeInBytes / 1000000.0

        console.log(i, "size: ", fileSizeInMegabytes);
        await time(3);
    }


})();

