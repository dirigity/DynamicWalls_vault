const fs = require("fs");
const { writeFile } = require("node:fs/promises");

function collect_tags(tag_hierarchy) {
    let tags = [];
    for (let tag in tag_hierarchy) {
        tags.push(tag);
        tags = tags.concat(tag_hierarchy[tag].synonyms)
        tags = tags.concat(collect_tags(tag_hierarchy[tag].sub_tags))
    }
    return tags;
}

(() => {

    let tag_hierarchy = JSON.parse(fs.readFileSync("tag_system/tag_hierarchy.json"));

    let tags = collect_tags(tag_hierarchy);

    console.log("collected tags: ", tags);

    fs.readdir("vault/media", async (err, files) => {

        if (err) {
            throw err;
        }

        let res = {};

        Promise.all(files.map(file => {
            return new Promise((r) => {
                fs.readFile("vault/media/" + file + "/head.json", { encoding: 'utf8', flag: 'r' }, (err, raw_data) => {

                    const data = JSON.parse(raw_data);

                    console.log(data)
                    for (let head_tag of data.classification.tags) {
                        let found = false;

                        for (let existing_tag of tags) {
                            if (existing_tag == head_tag) {
                                found = true;
                            }
                        }

                        if (!found) {
                            throw "unhiearchyfied tag: " + head_tag;
                        }
                    }


                    res["vault/" + file + "/head.json"] = data.classification;

                    r();
                })
            })
        })).then(() => {
            // console.log(res)
            writeFile("vault_index.json", JSON.stringify(res));
        })


    });

})();