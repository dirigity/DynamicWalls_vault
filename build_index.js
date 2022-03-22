const fs = require("fs");
const { writeFile } = require("node:fs/promises");

function readWord(str, i, debug) {
    // console.log(debug + "word", i)

    if (str[i] != '"') {
        // console.log("debug: " + str.substring(i, i + 15))
        throw "cagaste " + i;
    }
    i++;
    let ret = "";
    while (str[i] != '"') {
        ret += str[i];
        i++;
    }
    i++;

    return {
        "word": ret,
        "i": i
    }
}

function readSynonyms(str, i, debug) {
    // console.log(debug + "synonims", i)
    if (str[i] != "(") {

        // console.log(debug + "  empty synonyms at: ", i)
        return {
            "synonyms": [],
            "i": i
        }
    }

    let ret = [];
    while (str[i] == "," || str[i] == "(") {
        i++;
        let { word, i: i_ } = readWord(str, i, debug + "   ");
        i = i_;
        ret.push(word);
    }

    // console.log(debug + " found synonyms: ", ret)
    i++;

    return {
        "synonyms": ret,
        "i": i
    }


}

function readSubTags(str, i, debug) {
    // console.log(debug + "subtags", i)

    if (str[i] == "{") {
        i++;
    } else {
        // console.log(debug + "  empty subtags at: ", i)
        return {
            "sub_tags": {},
            "i": i
        }
    }
    let ret = {};

    while (str[i] != "}") {
        let { name, ret: tag, i: i_ } = readTag(str, i, debug + "   ");
        i = i_;
        ret[name] = tag;
    }

    // console.log(debug + "  >", ret, str[i]);

    i++;
    return {
        "sub_tags": ret,
        "i": i
    }
}

function readTag(str, i, debug) {
    // console.log(debug + "tag", i)
    let { word: name, i: i_ } = readWord(str, i, debug + "   ");
    i = i_
    let { synonyms, i: i__ } = readSynonyms(str, i, debug + "   ");
    i = i__
    let { sub_tags, i: i___ } = readSubTags(str, i, debug + "   ");
    i = i___

    ret = {
        "synonyms": synonyms,
        "sub_tags": sub_tags,
    };

    return {
        "i": i,
        "name": name,
        "ret": ret,
    }

}

(() => {

    fs.readFile("tag_hierarchy.tree", { encoding: 'utf8', flag: 'r' }, (err, data) => {

        let i = 0;
        let str = "";
        let inside_a_literal = false;
        // console.log(data)
        while (i < data.length) {
            if (data[i] == '"') {
                inside_a_literal = !inside_a_literal;
            }

            if ((data[i] != " " && data[i] != "\n" && data[i] != "\r") || inside_a_literal) {
                str += data[i];
            } else {
                //console.log(">", data[i]);
            }
            i++;
            //console.log("> " + str + " <");

        }
        //console.log("> " + str + " <");

        fs.writeFile("tag_hierarchy.json", JSON.stringify(readTag(str, 0, "").ret.sub_tags), () => { });
    })

    fs.readdir("vault", async (err, files) => {

        if (err) {
            throw err;
        }

        let res = {};

        Promise.all(files.map(file => {
            return new Promise((r) => {
                fs.readFile("vault/" + file + "/head.json", { encoding: 'utf8', flag: 'r' }, (err, data) => {

                    console.log(JSON.parse(data).classification);
                    res["vault/" + file + "/head.json"] = JSON.parse(data).classification;

                    // TODO comprobar que todas las tags existen

                    r();
                })
            })
        })).then(() => {
            console.log(res)
            writeFile("index.json", JSON.stringify(res));
        })


    });
})();