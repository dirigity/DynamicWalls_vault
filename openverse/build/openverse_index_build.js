const fs = require("fs");


let res = {};
const openverse_lib = JSON.parse(fs.readFileSync("openverse/build/openverse.json"))

for (let p of openverse_lib) {

    let path = "openverse/media/" + p.id + "/";
    let file = path + "head.json";
    let built_tags = [];
    for (let t of p.tags) {
        built_tags.push(t.name)
    }
    let classification = {
        "title": p.title,
        "tags": built_tags,
        "description": null,
        "author": p.creator,
        "authot_link": p.creator_url,
        "license": p.license + "-" + p.license_version,
        "license_link": p.license_url
    }

    let head = {
        "type": "url-img",
        "imgUrl": p.url,
        "classification": classification
    }
    fs.mkdirSync(path, { recursive: true })
    fs.writeFileSync(file, JSON.stringify(head));



    res[file] = classification;
}

fs.writeFileSync("openverse_index.json", JSON.stringify(res));