module.exports = {
  title: "Homestuck POV Cam Port", 
  author: "<a href='https://github.com/madman-bob/Homestuck-POV-Cam'>madman-bob</a>, ported by <a href='https://flaringk.github.io/Portfolio/'>FlaringK</a>",
  modVersion: 0.1,

  summary: "A port of madman-bob's Homestuck POV Cam Chrome extension",
  description: "A port of <a href='https://github.com/madman-bob/Homestuck-POV-Cam'>madman-bob</a>'s Homestuck POV Cam Chrome extension to the UHC. <b>This mod will unfortunately bug out with multiple tabs, only the furthest right tab will display the correct timeline links</b><h3>Changing the below options will require a full reload [ctrl + r]</h3>",

  // Add images to UHC
  routes: {
    "assets://images/araida.png": "./icons/aradia.png"
  },
  trees: {
    './icons/': 'assets://images/'
  },

  // Turn on and off each page group
  settings: {
    boolean: [{
      model: "Kids",
      label: "Disable Beta Kids timelines",
    },
    {
      model: "Kids' Guardians",
      label: "Disable Beta Kids' Guardians timelines",
    },
    {
      model: "Kids' Sprites",
      label: "Disable Beta Kids' Sprites timelines",
    },
    {
      model: "The Felt",
      label: "Disable The Felt timelines",
    },
    {
      model: "Kids' Exiles",
      label: "Disable Beta Kids' Exiles timelines",
    },
    {
      model: "Kids' Agents",
      label: "Disable Beta Kids' Agents timelines",
    },
    {
      model: "Midnight Crew",
      label: "Disable Midnight Crew timelines",
    },
    {
      model: "Trolls",
      label: "Disable Trolls timelines",
    },
    {
      model: "Trolls' Ancestors",
      label: "Disable Trolls' Ancestors timelines",
    },
    {
      model: "Alpha Kids",
      label: "Disable Alpha Kids timelines",
    },
    {
      model: "Alpha Kids' Sprites",
      label: "Disable Alpha Kids' Sprites timelines",
    },
    {
      model: "Alpha Kids' Agents",
      label: "Disable Alpha Kids' Agents timelines",
    },
    {
      model: "Alpha Trolls",
      label: "Disable Alpha Trolls timelines",
    },
    {
      model: "Cherubs",
      label: "Disable Cherubs timelines",
    }],
  },

  edit: true,

  computed(api) {
    // Load Json
    const povData = api.readJson('./timelines.json')
    api.logger.info(povData)

    // Array of next page indexes
    let nextPageArray = {}

    // Fill nextPageArray
    // Do this before edit due to some links not having pages
    for (const [pagenum, linkData] of Object.entries(povData.timelines)) {
      let nextpages = []

      for (let i = 0; i < linkData.length; i++) {
        if (linkData[i][4][0]) nextpages.push(`00${linkData[i][4][0][0]}`)
        else nextpages.push(nextpages[nextpages.length - 1])
      }

      nextPageArray[`00${pagenum}`] = nextpages

    }

    api.logger.info(nextPageArray)
    
    return {
      edit(archive) {

        // For each page in homestuck
        for (let i = 1901; i < 9999; i++) {
          const pageString = `00${i}`;
          // if the page exists (prevents certain errors)
          if (archive.mspa.story[pageString] && nextPageArray[pageString]) {

              // Add new next pages to 
              archive.mspa.story[pageString].next = archive.mspa.story[pageString].next.concat(nextPageArray[pageString])

              // Create style for links
              const timelinePage = povData.timelines[String(i)]

              let LinkStyle = ""

              // Loop throught array backwards to avoid styling the original links 
              for (let i = timelinePage.length - 1; i >= 0; i--) {
                let linkData = timelinePage[timelinePage.length - i - 1]
                let linkIndex = archive.mspa.story[pageString].next.length - i
                LinkStyle += `
                .nextArrow div:nth-child(${linkIndex}) {
                  ${api.store.get(povData.groups[linkData[3]]) ? "display: none" : ""}
                }
                .nextArrow div:nth-child(${linkIndex}) a {
                  color: ${povData.colours[linkData[1]]}; 
                  ${povData.colours[linkData[1]] == "#FFFFFF" ? "text-shadow: 1px 1px 0px black;" : ""}
                } 
                .nextArrow div:nth-child(${linkIndex}) p::Before { 
                  content: url("assets://images/${povData.images[linkData[2]]}");
                  display: inline-block;
                  transform: translateY(5px); 
                }
                 `
              }

              archive.mspa.story[pageString].content += `<style>${LinkStyle}</style>`

          }
        }

      }
    }
  }

}