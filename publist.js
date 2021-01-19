const ghpages = require("gh-pages")
console.log("同步中...")
ghpages.publish(
    "./dist",
    {
        branch: "gh-pages",
    },
    function () {
        console.log("同步完成")
    }
)
