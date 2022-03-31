const fs = require("fs");


let res = {};
const openverse_lib = JSON.parse(fs.readFileSync("openverse/build/openverse.json"))

function collect_tags(tag_hierarchy) {
    let tags = [];
    for (let tag in tag_hierarchy) {
        tags.push(tag);
        tags = tags.concat(tag_hierarchy[tag].synonyms)
        tags = tags.concat(collect_tags(tag_hierarchy[tag].sub_tags))
    }
    return tags;
}

let tag_hierarchy = JSON.parse(fs.readFileSync("tag_system/tag_hierarchy.json"));

let tags = collect_tags(tag_hierarchy);

let error = false;
let unhiearchyfied_tags = [];
for (let p of openverse_lib) {

    let path = "openverse/media/" + p.id + "/";
    let file = path + "head.json";
    let built_tags = [];
    for (let t of p.tags) {
        let found = false;

        for (let existing_tag of tags) {
            if (existing_tag == t.name) {
                found = true;
            }
        }

        if (!found) {
            error = true;
            unhiearchyfied_tags.push(t.name);
        }else{
            built_tags.push(t.name)

        }
        


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
        "thumbUrl": p.thumbnail,
        "classification": classification
    }

    fs.mkdirSync(path, { recursive: true })
    fs.writeFileSync(file, JSON.stringify(head));

    res[file] = classification;

}

if (!error) {
    fs.writeFileSync("openverse_index.json", JSON.stringify(res));
}
console.log(unhiearchyfied_tags);
