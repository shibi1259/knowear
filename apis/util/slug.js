const slugify = require('slugify')

module.exports.createSlug = async (db, title, obj, replacement = '-', toLower = true, trim = true) => {
    let newTitle = await this.generateSlug(title)
    for (let i = 1; i < i + 1; i++) {
        const isExist = await this.isSlugExist(db, obj);
        if (isExist) {
            newTitle = await this.generateSlug(`${title}-${i}`)
            Object.keys(obj).forEach(e => obj[e] = newTitle)
        } else {
            break
        }
    }

    return await this.generateSlug(newTitle, replacement = '-', toLower = true, trim = true)
}


module.exports.isSlugExist = async (db, obj = {slug: ''}) => {
    try {
        let count = await db.countDocuments(obj);
        return count > 0;
    } catch (error) {
        return false
        throw error;
    }
}

module.exports.generateSlug = async (title, replacement = '-', toLower = true, trim = true) => {
    return slugify(title, {
        replacement: replacement,
        remove: undefined, 
        lower: toLower,   
        strict: false,  
        locale: 'vi',  
        trim: trim   
    })
}
