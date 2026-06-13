#!/usr/bin/env python3
"""Merge per-neighborhood enrichment (meta, narrative, events, differentiator)
into data/areas.json. Each neighborhood gets unique copy referencing local
venues + relevant event types. Run once; re-running is idempotent."""
import json
from pathlib import Path

ENRICHMENT = {}  # slug -> dict

def add(slug, meta_title, meta_desc, narrative, events, differentiator):
    ENRICHMENT[slug] = {
        "metaTitle": meta_title,
        "metaDescription": meta_desc,
        "narrative": narrative,
        "events": [{"title": t, "copy": c} for t, c in events],
        "differentiator": differentiator,
    }

# ============ SAN GABRIEL VALLEY (1/2) ============

add("pasadena",
    "Pasadena Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Luxury open-air DSLR photo booth rental in Pasadena. Castle Green weddings, Langham galas, Huntington Library events. Charity galas and corporate.",
    [
        "Pasadena is the San Gabriel Valley's anchor city — Castle Green, the Langham Huntington, the Maxwell House, the Norton Simon Museum, the Pasadena Convention Center, the Huntington Library and Gardens, the Rose Bowl, and a year-round calendar of estate weddings, charity galas, corporate conferences, and family celebrations at scale. Our open-air photo booth has covered events at most of them.",
        "The booth's walnut-and-linen build reads as furniture in any of Pasadena's formal rooms — Craftsman estates, the Langham ballroom, the Huntington garden venues. The DSLR sensor handles the dramatic afternoon-into-evening lighting these venues specialize in.",
    ],
    [
        ("Estate Wedding Photo Booth Rental in Pasadena", "Castle Green weddings. Langham Huntington ceremonies. Maxwell House receptions. Private estate weddings across Altadena and San Marino. Our wedding photo booth rental fits Pasadena's formal scale. Custom strip templates match your invitation suite."),
        ("Charity Galas, Foundation Events & Awards", "Tournament of Roses Foundation events. Pasadena Symphony fundraisers. Norton Simon Annual. Huntington Library galas. Our gala photo booth rental and charity gala photo booth rental setups fit Pasadena's serious black-tie calendar."),
        ("Corporate Conferences & Trade Events", "Pasadena Convention Center conferences. Westin Pasadena corporate events. Sheraton Pasadena business meetings. Our corporate conference photo booth and trade show photo booth rental setups bring custom welcome screens, branded strip templates, and a rear-display reel."),
        ("Bar Mitzvah, Bat Mitzvah & Family Milestones", "Pasadena's family-centered community hosts year-round mitzvah celebrations at PJTC and family homes across Pasadena and San Marino. Our event photo booth rental setups bring custom templates with the family's color story."),
    ],
    "Why our open-air booth fits Pasadena: the booth reads as furniture in Craftsman estate interiors, in the Langham's ballrooms, and in the Huntington's garden venues. The DSLR sensor handles dramatic afternoon-into-evening estate lighting with the same archival print quality. Photo booth rental cost in Pasadena includes setup, attendant, prints, and the gallery — straightforward pricing for an event of any scale.",
)

add("arcadia",
    "Arcadia Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Arcadia. DSLR booth for Arboretum weddings, Santa Anita events, family galas — Westfield to the LA County Arboretum.",
    [
        "Arcadia anchors the east San Gabriel Valley's wedding venue circuit — the LA County Arboretum and Botanic Garden, Santa Anita Park, the Westfield Santa Anita event spaces, the Embassy Suites Arcadia, and a year-round calendar of garden weddings, family galas, country club events, and quinceañeras at scale.",
        "The booth's walnut-and-linen build reads beautifully against Arboretum garden ceremonies and country club ballroom interiors. The DSLR sensor handles afternoon-into-evening garden lighting and dramatic chandelier interiors with the same archival print quality.",
    ],
    [
        ("Garden Wedding Photo Booth Rental in Arcadia", "LA County Arboretum garden ceremonies. Embassy Suites Arcadia ballroom receptions. Country club weddings at the Arcadia-area venues. Our wedding photo booth rental fits the formal garden-to-ballroom scale Arcadia specializes in."),
        ("Quinceañera Photo Booth Rental", "Arcadia's family community hosts a strong quinceañera calendar. Our quinceañera photo booth rental ships with custom templates in the family's color story — pink, white, gold, champagne. The walnut booth reads warm against the gowns."),
        ("Country Club Galas & Family Events", "Arcadia country club galas and family events. Our gala photo booth rental and family event photo booth rental setups fit the country club formal scale."),
        ("Milestone Anniversary & Family Celebrations", "Arcadia families host beautiful multi-generational anniversary celebrations. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
    ],
    "Why our open-air booth fits Arcadia: the booth reads beautifully against Arboretum garden ceremonies and country club ballroom interiors. The DSLR sensor handles garden-to-ballroom lighting transitions with the same archival print quality. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for an Arcadia event of any scale.",
)

add("monrovia",
    "Monrovia Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Monrovia. DSLR booth for historic-downtown weddings, intimate gatherings, family events.",
    [
        "Monrovia is the historic-downtown corner of the central SGV — Old Town Monrovia, the Krikorian movie palace, the Aztec Hotel, and a year-round calendar of intimate weddings, milestone birthdays, and family celebrations. Most of what we cover here is small-format and family-rooted.",
        "The booth's walnut-and-linen build reads beautifully against Monrovia's historic-downtown interiors and intimate restaurant venues. The DSLR sensor handles warm restaurant lighting and string-lit backyard receptions cleanly.",
    ],
    [
        ("Intimate Wedding Photo Booth Rental", "Old Town Monrovia restaurant takeovers. Historic Aztec Hotel ceremonies. Backyard weddings in the residential streets. Our wedding photo booth rental fits the intimate scale Monrovia specializes in."),
        ("Milestone Birthdays & Anniversary Photo Booth", "Old Town Monrovia restaurant celebrations. Family backyard milestone events. Our birthday party photo booth and milestone anniversary photo booth setups deliver custom templates and real prints."),
        ("Bridal Shower & Baby Shower Photo Booth", "Monrovia restaurant brunches. Backyard showers in the residential streets. Our bridal shower photo booth rental and baby shower photo booth rental setups bring custom templates and premium props."),
        ("Family Wedding Photo Booth Rental", "Family weddings at the historic venues and backyards across Monrovia. Our wedding photo booth rental fits the family-celebration scale."),
    ],
    "Why our open-air booth fits Monrovia: the booth reads beautifully against historic-downtown interiors. The DSLR sensor pulls clean prints under warm restaurant lighting and string-lit receptions. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for an intimate Monrovia event.",
)

add("alhambra",
    "Alhambra Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Alhambra. DSLR booth for cultural weddings, quinceañeras, multigenerational family celebrations.",
    [
        "Alhambra is one of the SGV's deepest multigenerational family neighborhoods — Main Street's restaurant scene, the family-rooted banquet halls, and a year-round calendar of cultural weddings, quinceañeras, milestone anniversaries, and religious celebrations. Most of what we cover here mixes cultural tradition with multi-generational family scale.",
        "The booth's walnut-and-linen build reads warm against banquet hall ballroom interiors and against the cultural design vocabulary Alhambra runs on. The DSLR sensor handles dramatic ballroom chandelier lighting cleanly.",
    ],
    [
        ("Cultural Wedding Photo Booth Rental", "Big multi-generational weddings at the family banquet halls across Alhambra. Our wedding photo booth rental fits the scale these events expect — large guest lists, long receptions, and a booth that delivers a real print every guest will frame."),
        ("Quinceañera Photo Booth Rental", "Alhambra quinceañeras at banquet halls and family backyards. Our quinceañera photo booth rental ships with custom templates in the family's color story. The walnut booth reads warm against the gowns."),
        ("Cultural Celebrations & Religious Milestones", "Baptisms, communions, and the cultural milestones that anchor Alhambra's family calendar. Our event photo booth rental setups bring custom templates with the family's color story."),
        ("Milestone Anniversary & Family Celebrations", "Silver, gold, and ruby anniversaries that bring three or four generations of family together. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
    ],
    "Why our open-air booth fits Alhambra: the booth was built for multi-generational family events where three generations are in the same room. Real DSLR prints. A walnut frame that reads as furniture in a banquet hall. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for an Alhambra cultural celebration of any scale.",
)

add("san-gabriel",
    "San Gabriel Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in San Gabriel. DSLR booth for cultural wedding banquets, Mission-era venues, family celebrations.",
    [
        "San Gabriel is the Mission heritage corner of the SGV — Mission San Gabriel, the family-rooted banquet halls, the strong cultural community calendar, and a year-round mix of Cantonese, Taiwanese, and Vietnamese wedding banquets at scale. Most of what we cover here is large, formal, and multi-generational.",
        "The booth's walnut-and-linen build reads warm against banquet hall ballroom interiors and Mission-era architecture. The DSLR sensor handles dramatic chandelier interiors and the formal scale these events expect.",
    ],
    [
        ("Cultural Wedding Banquet Photo Booth Rental", "Cantonese, Taiwanese, and Vietnamese wedding banquets at the family banquet halls across San Gabriel. Our wedding photo booth rental scales — from 200-guest restaurants to 600-guest ballroom receptions. Custom strip templates match your invitation suite."),
        ("Cultural Celebrations & Religious Milestones", "Mission San Gabriel celebrations and the cultural milestones that anchor the community calendar. Our event photo booth rental setups bring custom templates."),
        ("Milestone Anniversary & Family Celebrations", "Multi-generational anniversary celebrations across San Gabriel. Our milestone anniversary photo booth setups deliver custom templates and real prints."),
        ("Quinceañera & Family Celebration Photo Booth", "San Gabriel's broader family community hosts quinceañeras and family milestones at banquet halls and family backyards. Our quinceañera photo booth rental setups bring custom templates."),
    ],
    "Why our open-air booth fits San Gabriel: the booth scales to the formal banquet hall ballroom interiors. Real DSLR prints. A walnut frame that reads as furniture. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a San Gabriel banquet of any scale.",
)

add("monterey-park",
    "Monterey Park Photo Booth Rental — DSLR Open-Air | Evergrain",
    "Open-air photo booth rental in Monterey Park. DSLR booth for Cantonese and Taiwanese wedding banquets, cultural celebrations.",
    [
        "Monterey Park anchors the SGV's Asian wedding banquet scene — large banquet halls, multi-course wedding dinners, and a year-round calendar of Cantonese, Taiwanese, and Mandarin family weddings, milestone celebrations, and cultural events. Most of what we cover here is large, formal, and multi-generational.",
        "The booth's walnut-and-linen build reads warm against banquet hall ballroom interiors. The DSLR sensor handles dramatic chandelier interiors and the formal scale these events expect.",
    ],
    [
        ("Cultural Wedding Banquet Photo Booth Rental", "Big multi-course wedding banquets at the family banquet halls across Monterey Park. Our wedding photo booth rental scales — from 200-guest restaurants to 600-guest ballroom receptions. Custom strip templates match the formal scale."),
        ("Milestone Anniversary & Family Celebrations", "Multi-generational anniversary celebrations across Monterey Park. Our milestone anniversary photo booth setups deliver custom templates and real prints that grandparents will frame."),
        ("Cultural Celebrations & Community Events", "Lunar New Year celebrations. Mid-Autumn festivals. Cultural foundation events. Our event photo booth rental setups bring custom templates."),
        ("Quinceañera & Family Photo Booth", "Monterey Park's broader family community hosts quinceañeras and milestone family celebrations. Our quinceañera photo booth rental setups bring custom templates and real prints."),
    ],
    "Why our open-air booth fits Monterey Park: the booth scales to formal banquet hall ballroom interiors. Real DSLR prints. A walnut frame that reads as furniture. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Monterey Park wedding banquet of any scale.",
)

add("rosemead",
    "Rosemead Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Rosemead. DSLR booth for family wedding banquets, quinceañeras, multigenerational celebrations.",
    [
        "Rosemead is one of the SGV's family-rooted community centers — Asian and Latino multigenerational families, the year-round wedding banquet calendar at the family-owned reception halls, and a strong calendar of quinceañeras, milestone anniversaries, and cultural celebrations.",
        "The booth's walnut-and-linen build reads warm against banquet hall ballroom interiors and family backyards. The DSLR sensor handles dramatic chandelier interiors with the same archival print quality.",
    ],
    [
        ("Wedding Banquet Photo Booth Rental", "Big multi-course wedding banquets at the family halls across Rosemead. Our wedding photo booth rental fits the family scale. Custom strip templates match your invitation suite."),
        ("Quinceañera Photo Booth Rental", "Rosemead quinceañeras at banquet halls and family backyards. Our quinceañera photo booth rental ships with custom templates in the family's color story. The walnut booth reads warm against the gowns."),
        ("Milestone Anniversary & Family Celebrations", "Multi-generational anniversary celebrations across Rosemead. Our milestone anniversary photo booth setups deliver custom templates and real prints."),
        ("Cultural Celebrations & Community Events", "Rosemead's cultural and community calendar runs year-round. Our event photo booth rental setups bring custom templates and real prints."),
    ],
    "Why our open-air booth fits Rosemead: the booth was built for multi-generational family events. Real DSLR prints. A walnut frame that reads as furniture in a banquet hall or in a backyard. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Rosemead family event of any scale.",
)

add("temple-city",
    "Temple City Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Temple City. DSLR booth for intimate family weddings, milestone events, community celebrations.",
    [
        "Temple City is the quiet residential SGV neighborhood — family backyards, intimate restaurant takeovers, and a year-round calendar of family weddings, milestone anniversaries, baby showers, and graduation parties. Most of what we cover here is intimate and family-rooted.",
        "The booth's walnut-and-linen build reads warm against family backyards and intimate restaurant interiors. The DSLR sensor handles string-lit backyard receptions and warm restaurant lighting cleanly.",
    ],
    [
        ("Intimate Family Wedding Photo Booth Rental", "Temple City backyard weddings — string-lit ceremonies, family-style receptions, and intimate restaurant takeovers. Our wedding photo booth rental fits the intimate family-celebration scale."),
        ("Milestone Anniversary & Birthday Photo Booth", "Family milestone celebrations across Temple City. Our milestone anniversary photo booth and birthday party photo booth setups deliver custom templates and real prints."),
        ("Bridal Shower & Baby Shower Photo Booth", "Family backyard showers across Temple City. Restaurant private dining. Our bridal shower photo booth rental and baby shower photo booth rental setups bring custom templates and a booth that fits a tight table layout."),
        ("Graduation Parties & Family Celebrations", "Temple City family graduation parties. Our graduation party photo booth rental setups bring custom templates and real prints."),
    ],
    "Why our open-air booth fits Temple City: the booth reads warm against family backyards and intimate restaurant interiors. The DSLR sensor pulls clean prints under string lights and warm restaurant lighting. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for an intimate Temple City family event.",
)

add("el-monte",
    "El Monte Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in El Monte. DSLR booth for quinceañeras, family weddings, milestone family celebrations.",
    [
        "El Monte is one of the SGV's deepest family-rooted communities — a year-round calendar of quinceañeras, family weddings, milestone anniversaries, and religious celebrations at the banquet halls and family backyards across the neighborhood.",
        "The booth's walnut-and-linen build reads warm against banquet hall ballroom interiors and family backyards. The DSLR sensor handles dramatic chandelier interiors and afternoon outdoor receptions with the same archival print quality.",
    ],
    [
        ("Quinceañera Photo Booth Rental", "This is one of our biggest event categories in El Monte. Quinceañera photo booth rental setups at banquet halls and family backyards. Custom photo templates with the quinceañera's name and color story — pink, white, gold, champagne, royal blue."),
        ("Family Wedding Photo Booth Rental", "Big multi-generational weddings at the family banquet halls across El Monte. Our wedding photo booth rental fits the scale these events expect — large guest lists, long receptions, and a booth that delivers a real print every guest will frame."),
        ("Milestone Anniversary & Family Celebrations", "El Monte families host beautiful milestone anniversary celebrations. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
        ("Religious Milestones & Cultural Celebrations", "Baptisms, communions, and the religious milestones that anchor El Monte's Catholic family calendar. Our event photo booth rental setups bring custom templates."),
    ],
    "Why our open-air booth fits El Monte: the booth was built for the multi-generational family event. Real DSLR prints. A walnut frame that reads as furniture in a banquet hall or in a backyard. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for an El Monte family celebration of any scale.",
)

add("west-covina",
    "West Covina Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in West Covina. DSLR booth for big-family weddings, country club events, milestone celebrations.",
    [
        "West Covina is the east SGV's family suburb — country club venues, master-planned residential streets, the Plaza West Covina, and a year-round calendar of big-family weddings, milestone anniversaries, graduation parties, and corporate events. Most of what we cover here is family-rooted and multi-generational.",
        "The booth's walnut-and-linen build reads as furniture in country club ballrooms and family backyards. The DSLR sensor handles dramatic chandelier interiors and outdoor afternoon receptions with the same archival print quality.",
    ],
    [
        ("Country Club Wedding Photo Booth Rental", "West Covina country club weddings — Brookside, the South Hills Country Club, and the surrounding banquet venues. Our wedding photo booth rental fits the family-formal scale."),
        ("Big-Family Wedding & Reception Photo Booth", "Big multi-generational weddings at banquet halls and country club venues across West Covina. Our wedding photo booth rental fits the family scale."),
        ("Milestone Anniversary & Family Celebrations", "Multi-generational anniversary celebrations across West Covina. Our milestone anniversary photo booth setups deliver custom templates and real prints."),
        ("Graduation Parties & Birthday Photo Booth", "West Covina graduation parties and milestone birthdays at country clubs and family homes. Our graduation party photo booth rental setups bring custom templates and real prints."),
    ],
    "Why our open-air booth fits West Covina: the booth reads as furniture in country club ballrooms and family backyards. The DSLR sensor handles ballroom chandelier lighting and outdoor afternoon receptions with the same archival print quality. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a West Covina family event of any scale.",
)



add("studio-city",
    "Studio City Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Studio City. DSLR booth for industry parties, weddings, restaurant takeovers — Ventura Boulevard to CBS Studios.",
    [
        "Studio City runs Ventura Boulevard — restaurant row, the CBS Studio Center, and a year-round mix of industry events, restaurant takeovers, and family celebrations. The neighborhood anchors a strong wedding venue circuit, a milestone-birthday calendar, and the after-work entertainment scene that runs through Sportsmen's Lodge.",
        "The booth's walnut-and-linen build reads warm against restaurant interiors and inside the entertainment-industry venues Studio City specializes in. The DSLR sensor handles the dramatic mixed lighting that Ventura Boulevard restaurants run on.",
    ],
    [
        ("Wedding Photo Booth Rental in Studio City", "Restaurant takeovers along Ventura Boulevard. Sportsmen's Lodge ballroom receptions. Backyard weddings in the hillside residential streets. Our wedding photo booth rental fits Studio City's mix of intimate and formal."),
        ("Industry Wrap Parties & Entertainment Events", "CBS Studio Center wrap parties. Industry after-parties at Studio City restaurants. Our wrap party photo booth rental and entertainment event photo booth rental setups bring custom welcome screens with the show's title card."),
        ("Restaurant Takeovers & Milestone Birthdays", "Ventura Boulevard restaurant private dining. Our private event photo booth rental and birthday party photo booth setups fit the intimate scale of Studio City celebrations."),
        ("Bridal Shower & Baby Shower Photo Booth", "Studio City restaurant brunches and backyard showers in the residential streets. Our bridal shower photo booth rental and baby shower photo booth rental setups bring custom templates and premium props."),
    ],
    "Why our open-air booth fits Studio City: the walnut frame reads warm against restaurant interiors and entertainment-industry venues. The DSLR sensor handles dramatic mixed lighting cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Studio City event of any scale.",
)

add("north-hollywood",
    "North Hollywood Photo Booth Rental — DSLR Open-Air | Evergrain",
    "Open-air photo booth rental in North Hollywood. DSLR booth for arts district weddings, theater receptions, wrap parties — NoHo to the Valley Performing Arts.",
    [
        "North Hollywood anchors the Valley's arts and theater scene — the NoHo Arts District, the smaller theater venues, the Academy of Television Arts & Sciences, and a year-round entertainment-industry event calendar. Most of what we cover here mixes creative-industry events with family weddings at the venues around Lankershim Boulevard.",
        "The booth's walnut-and-linen build reads warm against the theater interiors and loft venues NoHo specializes in. The DSLR sensor handles the dramatic mixed lighting that arts-district events run on.",
    ],
    [
        ("Wrap Party & Entertainment Event Photo Booth", "Industry wrap parties at NoHo venues. Theater opening night receptions. Our wrap party photo booth rental and entertainment event photo booth rental setups bring custom welcome screens with the production's title card."),
        ("Wedding Photo Booth Rental in North Hollywood", "Loft weddings in the NoHo Arts District. Theater venue receptions. Restaurant takeovers along Lankershim. Our wedding photo booth rental fits the arts-district scale these events run on."),
        ("Brand Activations & Creative-Industry Events", "Lifestyle brand events at NoHo lofts. Agency office activations. Our brand activation photo booth setups fit the arts-district aesthetic cleanly."),
        ("Milestone Birthdays & Anniversary Photo Booth", "Restaurant celebrations along Lankershim. Backyard milestone events in the surrounding residential streets. Our birthday party photo booth and milestone anniversary photo booth setups deliver custom templates and real prints."),
    ],
    "Why our open-air booth fits North Hollywood: the walnut frame reads warm against theater interiors and NoHo loft venues. The DSLR sensor handles dramatic mixed lighting cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a NoHo arts or industry event of any scale.",
)

add("sherman-oaks",
    "Sherman Oaks Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Sherman Oaks. DSLR booth for hilltop weddings, country club events, family celebrations — Galleria to Mulholland.",
    [
        "Sherman Oaks is the Valley's hilltop family neighborhood — Mulholland-adjacent estates, the Sherman Oaks Galleria event spaces, the hillside country clubs, and a year-round calendar of family weddings, bar/bat mitzvahs, milestone anniversaries, and graduation parties. Most of what we cover here is family-rooted and multi-generational.",
        "The booth's walnut-and-linen build reads as furniture in Sherman Oaks' hillside estate interiors and against country club ballroom lighting. The DSLR sensor handles the dramatic indoor-outdoor reception transitions hillside venues specialize in.",
    ],
    [
        ("Hilltop Wedding Photo Booth Rental", "Hillside estate weddings off Mulholland. Sherman Oaks country club ceremonies. Backyard receptions in the residential streets. Our wedding photo booth rental fits the formal hillside scale."),
        ("Bar Mitzvah & Bat Mitzvah Photo Booth", "Sherman Oaks anchors a strong bar mitzvah and bat mitzvah calendar — temple receptions and family home celebrations across the neighborhood. Our event photo booth rental setups bring custom templates with the family's color story."),
        ("Milestone Anniversary & Family Photo Booth", "Sherman Oaks families host beautiful milestone anniversary celebrations. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
        ("Graduation Party & Office Party Photo Booth", "Graduation party photo booth rentals across the Valley. Office party photo booth setups for the small businesses headquartered in Sherman Oaks. Custom templates and a booth that fits any room."),
    ],
    "Why our open-air booth fits Sherman Oaks: the booth reads as furniture in hillside estate interiors and country club ballrooms. The DSLR sensor handles indoor-outdoor reception transitions with the same archival print quality. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Sherman Oaks family event of any scale.",
)

add("encino",
    "Encino Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Encino. DSLR booth for bar/bat mitzvahs, family weddings, milestone events — Encino Glen to Ventura Boulevard.",
    [
        "Encino is the Valley's family-rooted heart — a strong Jewish community, the Encino Glen, family backyards across the residential streets, and a year-round calendar of bar mitzvahs, bat mitzvahs, family weddings, milestone anniversaries, and graduation parties. Most of what we cover here is multi-generational.",
        "The booth's walnut-and-linen build reads warm against family backyards and temple reception halls. The DSLR sensor handles afternoon-into-evening backyard lighting and ballroom chandelier interiors with the same archival print quality.",
    ],
    [
        ("Bar Mitzvah & Bat Mitzvah Photo Booth", "Encino's bar mitzvah and bat mitzvah calendar runs year-round at temple reception halls and family home celebrations. Our event photo booth rental setups bring custom templates with the family's color story and the milestone date."),
        ("Backyard Wedding Photo Booth Rental", "Encino backyard weddings — string-lit ceremonies under heritage oaks, tented family-style receptions. Our wedding photo booth rental fits the family-celebration scale. Custom strip templates match your invitation suite."),
        ("Milestone Anniversary Photo Booth", "Encino families host beautiful milestone anniversary celebrations. Our milestone anniversary photo booth setups deliver custom templates and real prints that grandparents will frame."),
        ("Bridal Shower & Baby Shower Photo Booth", "Restaurant private dining along Ventura Boulevard. Backyard showers across the residential streets. Our bridal shower photo booth rental and baby shower photo booth rental setups bring custom templates and a booth that fits a tight table layout."),
    ],
    "Why our open-air booth fits Encino: the booth was built for the multi-generational family event where three generations are in the same room. Real DSLR prints. A walnut frame that reads as furniture in a temple reception hall or in a backyard. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for an Encino family celebration of any scale.",
)

add("tarzana",
    "Tarzana Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Tarzana. DSLR booth for garden weddings, family celebrations, intimate gatherings — Tarzana Hills to Ventura.",
    [
        "Tarzana is the quieter family corner of the south Valley — residential estates wrapping into the hills, Ventura Boulevard's restaurant scene, and a year-round calendar of intimate family weddings, milestone birthdays, and anniversary celebrations. Most of what we cover here is private and intimate.",
        "The booth's walnut-and-linen build reads warm against family backyards and restaurant private dining rooms. The DSLR sensor handles backyard string-lit receptions and warm restaurant interiors with the same archival print quality.",
    ],
    [
        ("Garden Wedding Photo Booth Rental", "Tarzana garden ceremonies under heritage oaks. Family backyard receptions in the hillside residential streets. Our wedding photo booth rental fits the intimate family-celebration scale."),
        ("Bar Mitzvah & Bat Mitzvah Photo Booth", "Tarzana shares a strong bar/bat mitzvah calendar with Encino and Sherman Oaks — family receptions across the neighborhood. Our event photo booth rental setups bring custom templates with the family's color story."),
        ("Milestone Birthday & Anniversary Photo Booth", "Family milestone celebrations in Tarzana backyards and restaurant private dining. Our birthday party photo booth and milestone anniversary photo booth setups deliver custom templates and real prints."),
        ("Bridal Shower & Baby Shower Photo Booth", "Restaurant brunches along Ventura Boulevard. Backyard showers in the residential streets. Our bridal shower photo booth rental and baby shower photo booth rental setups bring custom templates and a booth that fits a tight table layout."),
    ],
    "Why our open-air booth fits Tarzana: the booth reads as furniture in family backyards and restaurant private dining. The DSLR sensor pulls clean prints under string lights and warm restaurant interiors. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for an intimate Tarzana family event of any scale.",
)

add("woodland-hills",
    "Woodland Hills Photo Booth Rental — DSLR Open-Air | Evergrain",
    "Open-air photo booth rental in Woodland Hills. DSLR booth for country club galas, big-family weddings, corporate events — Warner Center to Topanga.",
    [
        "Woodland Hills runs Warner Center's corporate event calendar and the country club wedding circuit along the southwest Valley. The Warner Center hotels host year-round corporate events, hotel galas, and conferences. The Calabasas Country Club and Woodland Hills Country Club anchor a strong wedding venue calendar. Most of what we cover here mixes formal-corporate and family-celebration.",
        "The booth's walnut-and-linen build reads as furniture in country club ballrooms and inside Warner Center hotel interiors. The DSLR sensor handles dramatic ballroom chandelier lighting and corporate event spaces with the same archival print quality.",
    ],
    [
        ("Country Club Wedding Photo Booth Rental", "Woodland Hills Country Club weddings. Calabasas Country Club ceremonies and receptions. Our wedding photo booth rental fits the country club formal scale. Custom strip templates match your invitation suite."),
        ("Hotel Galas & Corporate Events", "Warner Center hotel ballroom galas. Corporate event photo booth rental setups for the offices headquartered in Warner Center. Awards ceremony photo booth setups for the southwest Valley business community."),
        ("Big-Family Weddings & Multi-Generational Events", "Woodland Hills family weddings — large guest lists, multi-generational receptions, and a strong dance floor. Our wedding photo booth rental fits the family scale these events run on."),
        ("Holiday Parties, Office Christmas & Company Events", "Warner Center offices run a strong December calendar. Our holiday party photo booth rental and company Christmas party photo booth setups fit the corporate scale these companies host."),
    ],
    "Why our open-air booth fits Woodland Hills: the booth reads as furniture in country club ballrooms and Warner Center hotel interiors. The DSLR sensor handles dramatic ballroom chandelier lighting and modern corporate event spaces. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Woodland Hills wedding or corporate event of any scale.",
)

add("reseda",
    "Reseda Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Reseda. DSLR booth for community weddings, family celebrations, milestone events.",
    [
        "Reseda is the central Valley's family-rooted neighborhood — residential streets, the Reseda Boulevard restaurant scene, and a year-round calendar of family weddings, quinceañeras, milestone anniversaries, and graduation parties. Most of what we cover here is multi-generational and warm.",
        "The booth's walnut-and-linen build reads warm against family backyards and banquet hall receptions. The DSLR sensor handles backyard string-lit receptions and ballroom interiors with the same archival print quality.",
    ],
    [
        ("Family Wedding Photo Booth Rental", "Reseda family weddings — backyard receptions, banquet hall ceremonies, restaurant takeovers. Our wedding photo booth rental fits the family scale these events run on. Custom strip templates match your invitation suite."),
        ("Quinceañera Photo Booth Rental", "Reseda quinceañeras at banquet halls and family backyards. Our quinceañera photo booth rental ships with custom templates in the family's color story. The walnut booth reads warm against the gowns and the ballroom lighting."),
        ("Milestone Anniversary & Family Photo Booth", "Multi-generational anniversary celebrations across Reseda. Our milestone anniversary photo booth setups deliver custom templates and real prints that grandparents will frame."),
        ("Graduation Party & Birthday Photo Booth", "Cal State Northridge graduation parties anchor a strong spring calendar. Our graduation party photo booth rental and birthday party photo booth setups fit the family-celebration scale."),
    ],
    "Why our open-air booth fits Reseda: the booth was built for the multi-generational family event. Real DSLR prints. A walnut frame that reads as furniture in a banquet hall or in a backyard. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Reseda family event of any scale.",
)

add("van-nuys",
    "Van Nuys Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Van Nuys. DSLR booth for warehouse weddings, brand activations, family events — Sherman Way to Van Nuys Airport.",
    [
        "Van Nuys mixes the Valley's industrial-warehouse aesthetic with strong family neighborhoods — Van Nuys Airport private hangar events, Sherman Way restaurant takeovers, warehouse-space wedding receptions, and a year-round calendar of family events and brand activations.",
        "The booth's walnut-and-linen build reads warm against the concrete and steel of Van Nuys warehouse spaces. The DSLR sensor handles the dramatic high-contrast lighting these industrial venues specialize in.",
    ],
    [
        ("Warehouse Wedding Photo Booth Rental", "Van Nuys warehouse weddings — concrete-walled receptions, industrial-chic ceremonies. Our wedding photo booth rental fits the warehouse aesthetic. The walnut booth provides the warmth the concrete doesn't."),
        ("Brand Activations & Industrial Events", "Van Nuys warehouse-space brand activations. Hangar events at the airport. Our brand activation photo booth and product launch photo booth rental setups fit the industrial-chic aesthetic Van Nuys specializes in."),
        ("Family Wedding & Quinceañera Photo Booth", "Van Nuys' family neighborhoods host year-round weddings and quinceañeras at banquet halls and family backyards. Our wedding photo booth rental and quinceañera photo booth rental setups fit the family scale."),
        ("Office Party & Corporate Photo Booth", "Van Nuys industrial and service businesses run year-round corporate events. Our office party photo booth rental setups bring custom welcome screens and branded strip templates."),
    ],
    "Why our open-air booth fits Van Nuys: the walnut frame reads warm against concrete and steel. The DSLR sensor handles high-contrast industrial lighting cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Van Nuys warehouse, brand, or family event of any scale.",
)

add("panorama-city",
    "Panorama City Photo Booth Rental — DSLR Open-Air | Evergrain",
    "Open-air photo booth rental in Panorama City. DSLR booth for quinceañeras, cultural weddings, family celebrations.",
    [
        "Panorama City anchors the central Valley's deep multigenerational family community — banquet halls along Van Nuys Boulevard, family backyards across the residential streets, and a year-round calendar of quinceañeras, cultural weddings, milestone anniversaries, and family celebrations.",
        "The booth's walnut-and-linen build reads warm against banquet hall ballroom lighting and family backyards. The DSLR sensor handles the dramatic chandelier interiors and outdoor afternoon receptions with the same archival print quality.",
    ],
    [
        ("Quinceañera Photo Booth Rental", "Panorama City quinceañeras at the family banquet halls and family backyards. Our quinceañera photo booth rental ships with custom templates in the family's color story — pink, white, gold, champagne. The walnut booth reads warm against the gowns."),
        ("Cultural Wedding Photo Booth Rental", "Big multi-generational weddings at banquet halls across Panorama City. Our wedding photo booth rental fits the family-celebration scale — large guest lists, long receptions, and a booth that delivers a real print every guest will frame."),
        ("Milestone Anniversary & Family Celebrations", "Silver, gold, and ruby anniversaries that bring three or four generations of family into one room. Our milestone anniversary photo booth setups deliver custom templates and real prints."),
        ("Bridal Shower, Baby Shower & Gender Reveal Photo Booth", "Family showers across Panorama City. Gender reveal photo booth rental setups with rear-display reels that run a build-up slideshow leading to the reveal moment."),
    ],
    "Why our open-air booth fits Panorama City: the booth was built for the multi-generational family event. Real DSLR prints. A walnut frame that reads as furniture in a banquet hall or in a backyard. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Panorama City family celebration.",
)

add("porter-ranch",
    "Porter Ranch Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Porter Ranch. DSLR booth for hilltop weddings, master-planned community events, family celebrations.",
    [
        "Porter Ranch is the north Valley's master-planned hilltop community — gated estates, country club access, and a year-round calendar of family weddings, milestone anniversaries, graduation parties, and bar/bat mitzvahs. Most of what we cover here is family-rooted and formal.",
        "The booth's walnut-and-linen build reads as furniture in hilltop estate interiors and against the master-planned community venues Porter Ranch is built from. The DSLR sensor handles afternoon-into-evening hillside lighting cleanly.",
    ],
    [
        ("Hilltop Wedding Photo Booth Rental", "Porter Ranch estate weddings with north-Valley views. Master-planned community venue ceremonies. Our wedding photo booth rental fits the hilltop family-celebration scale."),
        ("Bar Mitzvah & Bat Mitzvah Photo Booth", "Porter Ranch's Jewish community calendar anchors a steady bar mitzvah and bat mitzvah schedule — temple receptions and family home celebrations. Our event photo booth rental setups bring custom templates."),
        ("Graduation Party Photo Booth Rental", "Porter Ranch family graduation parties — high school, college, and milestone graduations. Our graduation party photo booth rental setups deliver custom templates and real prints."),
        ("Milestone Anniversary & Family Celebrations", "Porter Ranch families host beautiful milestone celebrations. Our milestone anniversary photo booth setups deliver custom templates and real prints that grandparents will frame."),
    ],
    "Why our open-air booth fits Porter Ranch: the booth reads as furniture in hilltop estate interiors. The DSLR sensor handles afternoon-into-evening hillside lighting cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Porter Ranch family event of any scale.",
)

add("burbank",
    "Burbank Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air DSLR photo booth rental in Burbank. Studio wraps, premieres, weddings — Warner Bros to Disney Studios and Castaway.",
    [
        "Burbank is the entertainment industry's working heart — Warner Bros, Disney Studios, Cartoon Network, ABC, NBC, and the dozens of independent production offices clustered between Riverside Drive and the lot. Castaway, Pickwick Gardens, and the smaller venues across Burbank host the year's biggest wrap parties, premiere after-parties, and industry events. Our open-air photo booth has covered events at most of them.",
        "The booth's walnut-and-linen build reads warm against the industrial-modern architecture Burbank specializes in. The DSLR sensor handles the dramatic mixed lighting of soundstage-adjacent venues with the same archival print quality.",
    ],
    [
        ("Wrap Party Photo Booth Rental", "Warner Bros wrap parties. Disney department celebrations. NBC and ABC wrap nights at Castaway and Pickwick Gardens. Our wrap party photo booth rental setups bring custom welcome screens with the show's title card and a rear-display reel running the editor cut."),
        ("Film Premiere & Entertainment Event Photo Booth", "Burbank premiere after-parties. Industry celebration dinners. Our film premiere photo booth rental and entertainment event photo booth rental setups bring custom welcome screens, branded strip templates, and an attendant who runs the line through an industry crowd."),
        ("Wedding Photo Booth Rental in Burbank", "Castaway hilltop weddings. Pickwick Gardens ceremonies. Backyard weddings in the residential streets. Our wedding photo booth rental fits Burbank's mix of industry and family-celebration."),
        ("Corporate Events & Office Parties", "Studio campus department events. Office party photo booth rental setups for the production companies and agency offices headquartered in Burbank. Holiday party photo booth rental setups across the studio system."),
    ],
    "Why our open-air booth fits Burbank: the walnut frame reads warm against industrial-modern architecture and soundstage-adjacent venues. The DSLR sensor handles dramatic mixed lighting cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Burbank studio, wrap, or family event of any scale.",
)

add("glendale",
    "Glendale Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air DSLR photo booth rental in Glendale. Armenian weddings, family celebrations, hotel galas — Brand Park to the Americana.",
    [
        "Glendale is the heart of LA's Armenian community — one of the deepest multigenerational family neighborhoods in California, anchored by Brand Park, the Americana at Brand, the Glendale Galleria, and a strong year-round calendar of Armenian weddings, cultural celebrations, milestone anniversaries, baptisms, and family events.",
        "The booth's walnut-and-linen build reads warm against the Armenian banquet hall interiors that Glendale specializes in. The DSLR sensor handles the dramatic chandelier ballroom lighting these venues run on.",
    ],
    [
        ("Armenian Wedding Photo Booth Rental", "Big multi-generational weddings at the Armenian banquet halls across Glendale — Le Foyer, Anoush, and the larger reception venues. Our wedding photo booth rental fits the scale these events expect."),
        ("Religious Milestones & Cultural Celebrations", "Baptisms, communions, and the cultural milestones that anchor the Armenian community calendar. Our event photo booth rental setups bring custom templates with the family's color story."),
        ("Milestone Anniversary & Family Celebrations", "Silver, gold, and ruby anniversaries that bring three or four generations of an Armenian family together. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
        ("Quinceañera & Birthday Party Photo Booth", "Glendale's broader family community hosts quinceañeras and milestone birthdays at the banquet halls and family backyards. Our quinceañera photo booth rental and birthday party photo booth setups bring custom templates and real prints."),
    ],
    "Why our open-air booth fits Glendale: the booth was built for the multi-generational Armenian family wedding where three generations are in the same room. Real DSLR prints. A walnut frame that reads as furniture in any of Glendale's banquet halls. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Glendale family event of any scale.",
)

add("san-fernando",
    "San Fernando Photo Booth Rental — DSLR Open-Air | Evergrain",
    "Open-air photo booth rental in San Fernando. DSLR booth for family weddings, quinceañeras, milestone celebrations — Mission heritage venues.",
    [
        "San Fernando is the Mission-heritage corner of the north Valley — Mission San Fernando Rey de España, family-rooted banquet halls, and a year-round calendar of family weddings, quinceañeras, religious milestones, and milestone anniversaries. Most of what we cover here is multi-generational and traditional.",
        "The booth's walnut-and-linen build reads warm against Mission-era architecture and banquet hall ballroom lighting. The DSLR sensor handles the dramatic chandelier interiors and outdoor afternoon ceremonies with the same archival print quality.",
    ],
    [
        ("Family Wedding Photo Booth Rental", "Big multi-generational weddings at the family banquet halls across San Fernando. Our wedding photo booth rental fits the family scale — large guest lists, long receptions, and a booth that delivers a real print every guest will frame."),
        ("Quinceañera Photo Booth Rental", "San Fernando quinceañeras at banquet halls and family backyards. Our quinceañera photo booth rental ships with custom templates in the family's color story. The walnut booth reads warm against the gowns."),
        ("Religious Milestones & Cultural Celebrations", "Baptisms, communions, and the cultural milestones that anchor the San Fernando family calendar. Our event photo booth rental setups bring custom templates with the family's color story."),
        ("Milestone Anniversary & Family Celebrations", "San Fernando families host beautiful multi-generational anniversary celebrations. Our milestone anniversary photo booth setups deliver custom templates and real prints."),
    ],
    "Why our open-air booth fits San Fernando: the booth was built for the multi-generational family event. Real DSLR prints. A walnut frame that reads as furniture in a banquet hall or in a backyard. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a San Fernando family celebration of any scale.",
)

add("calabasas",
    "Calabasas Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Luxury open-air photo booth rental in Calabasas. DSLR booth for ranch weddings, country club galas, celebrity-style events — Calamigos to Saddlerock.",
    [
        "Calabasas is the southwest Valley's luxury corner — Calamigos Ranch, the Calabasas Country Club, Saddlerock Ranch, Hummingbird Nest, and the year-round calendar of high-end ranch weddings, country club galas, milestone anniversaries, and celebrity-style private events. Our open-air photo booth has covered events at most of them.",
        "The booth's walnut-and-linen build reads as furniture against the ranch and country club venues Calabasas specializes in. The DSLR sensor handles afternoon-into-evening ranch lighting and ballroom chandelier interiors with the same archival print quality.",
    ],
    [
        ("Ranch Wedding Photo Booth Rental", "Calamigos Ranch weddings. Saddlerock Ranch ceremonies. Private ranch property receptions across the hills. Our wedding photo booth rental fits the ranch-luxury scale — outdoor afternoon ceremonies, tented evening receptions, and a booth that reads warm against the ranch architecture."),
        ("Country Club Galas & Charity Events", "Calabasas Country Club galas and charity events. Our gala photo booth rental and charity gala photo booth rental setups fit the country club formal scale."),
        ("Luxury Private Dining & Upscale Events", "Calabasas private estate dinners. Restaurant takeovers along Calabasas Road. Our luxury photo booth rental and upscale party photo booth rental setups fit the design-forward intimate scale these events run on."),
        ("Milestone Birthdays & Anniversary Photo Booth", "Family milestone celebrations at the country club, at ranch venues, and at private estate homes. Our milestone anniversary photo booth and birthday party photo booth setups deliver custom templates and real prints."),
    ],
    "Why our open-air booth fits Calabasas: the booth reads as furniture against ranch and country club architecture. The DSLR sensor handles afternoon-into-evening ranch lighting and ballroom chandelier interiors with the same archival print quality. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Calabasas luxury ranch or country club event.",
)



add("santa-monica",
    "Santa Monica Photo Booth Rental — DSLR Open-Air | Evergrain",
    "Luxury open-air DSLR photo booth rental in Santa Monica. Beachfront weddings, hotel galas, brand events — Pier to Annenberg Beach House.",
    [
        "Santa Monica anchors the Westside's coastal event calendar — the Santa Monica Pier, the Annenberg Community Beach House, Shutters on the Beach, Casa Del Mar, the Fairmont Miramar, the Georgian, and a stretch of Ocean Avenue that has hosted weddings, hotel galas, brand activations, and milestone events at scale year-round. Our open-air photo booth has covered events at most of them.",
        "The booth's walnut-and-linen build reads beautifully against Santa Monica's coastal light and inside the hotel ballrooms that anchor the neighborhood. The DSLR sensor handles the golden-hour light, the tented oceanfront receptions, and the formal ballroom interiors with the same archival print quality.",
    ],
    [
        ("Beach Wedding Photo Booth Rental in Santa Monica", "Annenberg Beach House ceremonies. Shutters on the Beach receptions. Hotel ballroom weddings at Casa Del Mar and the Fairmont Miramar. Our wedding photo booth rental fits the coastal scale — golden-hour ceremonies, tented oceanfront receptions, and ballroom dinners."),
        ("Hotel Galas & Charity Events", "Santa Monica's Ocean Avenue hotels run a year-round black-tie calendar. Our gala photo booth rental and charity gala photo booth rental setups fit these formal rooms cleanly. Awards ceremony photo booth setups for the Westside business and creative-industry community."),
        ("Brand Activations & Product Launches", "Tech offices in Silicon Beach. Lifestyle brand showrooms along Main Street. Hotel takeovers for product launches. Our brand activation photo booth and product launch photo booth rental setups fit Santa Monica's design-forward venues."),
        ("Bachelorette, Bridal Shower & Baby Shower Photo Booth", "Santa Monica is the heart of the LA bachelorette weekend. Felix Trattoria. The hotel pool decks. Restaurant private rooms. Our bachelorette photo booth, bridal shower photo booth rental, and baby shower photo booth rental setups run heavy here through the summer."),
    ],
    "Why our open-air booth fits Santa Monica: the booth handles golden-hour coastal light, tented oceanfront receptions, and formal ballroom lighting with the same archival print quality. Walnut-and-linen build that reads as furniture beachfront or ballroom-side. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Santa Monica event of any scale.",
)

add("venice",
    "Venice Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air DSLR photo booth rental in Venice CA. Canal weddings, Abbot Kinney brand launches, design events — beachfront to Rose Avenue.",
    [
        "Venice runs on design — Abbot Kinney Boulevard, the Venice Canals, the boardwalk, and a year-round event calendar that mixes weddings, design-led brand launches, milestone birthdays, and creative-industry parties. Felix Trattoria, Gjusta, the Rose Cafe, and the smaller restaurants and shops that anchor Abbot Kinney all host private events at the kind of scale Venice specializes in.",
        "The booth's walnut-and-linen build matches the design vocabulary that Venice already runs on — warm wood, brushed linen, real materials. The DSLR sensor handles the mixed lighting that Venice events specialize in — beach light, restaurant interiors, indoor-outdoor receptions.",
    ],
    [
        ("Wedding Photo Booth Rental in Venice", "Canal-side ceremonies. Beach receptions. Restaurant takeovers along Abbot Kinney. Our wedding photo booth rental fits Venice's design-forward scale. The walnut booth reads warm against indoor-outdoor receptions and the DSLR sensor handles golden-hour beach light cleanly."),
        ("Brand Activations & Product Launches", "Abbot Kinney shop launches. Erewhon flower-wall activations. Indie brand pop-ups along Lincoln. Our brand activation photo booth and product launch photo booth rental setups fit the Venice design-led aesthetic."),
        ("Bridal Shower & Bachelorette Photo Booth", "Felix Trattoria. Gjusta. The Rose Cafe. The hotel pool decks. Our bridal shower photo booth rental and bachelorette photo booth setups in Venice fit the design-forward scale of these venues."),
        ("Milestone Birthdays & Creative-Industry Parties", "Agency offices in Venice. Indie production studios. Beachfront milestone birthdays. Our birthday party photo booth and private event photo booth rental setups in Venice fit the design-led, intimate scale these events expect."),
    ],
    "Why our open-air booth fits Venice: the booth's design vocabulary — walnut wood, brushed linen, archival prints — matches what Venice already runs on. The DSLR sensor handles indoor-outdoor receptions and golden-hour beach light cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Venice event of any scale.",
)

add("marina-del-rey",
    "Marina del Rey Photo Booth Rental — DSLR Open-Air | Evergrain",
    "Open-air photo booth rental in Marina del Rey. DSLR booth for yacht club weddings, waterfront receptions, brand events — Marina to Burton Chace.",
    [
        "Marina del Rey is the Westside's waterfront event corner — the largest small-craft harbor in the country, yacht clubs along the channel, the Marina del Rey Hotel, the Ritz-Carlton, and Burton Chace Park. Most of what we cover here is waterfront — yacht club weddings, marina-side receptions, hotel galas with the harbor as the backdrop.",
        "The booth's walnut-and-linen build reads beautifully against marine architecture and inside the hotel ballrooms that anchor the marina. The DSLR sensor handles the dramatic mixed lighting — golden-hour reflections off the water, hotel interiors, tented dock receptions.",
    ],
    [
        ("Yacht Club Wedding Photo Booth Rental", "Marina del Rey yacht club weddings — Del Rey Yacht Club, California Yacht Club, the smaller marina-side venues. Our wedding photo booth rental fits the waterfront formal scale. Custom strip templates match your invitation suite."),
        ("Hotel Galas & Waterfront Events", "Marina del Rey Hotel ballroom galas. Ritz-Carlton corporate events. Burton Chace Park outdoor receptions. Our gala photo booth rental and corporate event photo booth rental setups fit the marina's formal calendar."),
        ("Bachelorette & Bridal Shower Photo Booth", "Yacht-side brunches. Hotel pool deck bachelorette weekends. Restaurant takeovers along the marina. Our bachelorette photo booth and bridal shower photo booth rental setups in Marina del Rey lean coastal."),
        ("Corporate Retreats & Brand Events", "The marina hotels and yacht clubs host year-round corporate retreats and brand events. Our corporate event photo booth rental and brand activation photo booth setups fit these waterfront venues cleanly."),
    ],
    "Why our open-air booth fits Marina del Rey: the booth handles golden-hour harbor reflections, tented dock receptions, and hotel ballroom lighting with the same archival print quality. Walnut-and-linen build that reads beautifully against marine architecture. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Marina del Rey event of any scale.",
)

add("beverly-hills",
    "Beverly Hills Photo Booth Rental — Luxury Open-Air | Evergrain",
    "Luxury open-air DSLR photo booth rental in Beverly Hills. Hotel galas, weddings, awards ceremonies — Beverly Hills Hotel to the Wallis.",
    [
        "Beverly Hills hosts more black-tie events per square mile than almost anywhere else in California. The Beverly Hills Hotel. The Beverly Wilshire. The Peninsula. The Maybourne. The L'Ermitage. The Waldorf Astoria. The Wallis Annenberg Center for the Performing Arts. Rodeo Drive. Our open-air photo booth has covered events at most of them.",
        "The booth's walnut-and-linen build reads as furniture in any of Beverly Hills' formal rooms. The DSLR sensor handles the dramatic chandelier lighting and gallery-style display lighting these venues specialize in. Custom strip templates match the formal scale these events expect.",
    ],
    [
        ("Hotel Wedding Photo Booth Rental", "Beverly Hills Hotel garden ceremonies. Beverly Wilshire ballroom receptions. Peninsula and Maybourne intimate weddings. Our luxury photo booth rental and wedding photo booth rental setups fit Beverly Hills' formal scale. Custom strip templates match the invitation suite your stationer designed."),
        ("Charity Galas, Awards & Foundation Events", "The Wallis Annenberg Center. The Beverly Hilton (just inside the city line). The hotel ballrooms across the city. Our gala photo booth rental and charity gala photo booth rental setups fit this serious black-tie calendar."),
        ("Bar Mitzvah & Bat Mitzvah Photo Booth", "Beverly Hills anchors a strong bar mitzvah and bat mitzvah calendar — temple receptions at Sinai Temple and Wilshire Boulevard Temple, family receptions at the hotels. Our event photo booth rental setups bring custom templates with the family's color story."),
        ("Brand Activations & Luxury Product Launches", "Rodeo Drive shop launches. Hotel suite takeovers for fashion brands. Our brand activation photo booth and product launch photo booth rental setups fit the luxury scale of Beverly Hills events."),
    ],
    "Why our open-air booth fits Beverly Hills: the booth reads furniture-grade in any of Beverly Hills' formal rooms — the Beverly Hills Hotel, the Beverly Wilshire, the Peninsula. The DSLR sensor handles dramatic chandelier lighting and gallery-style display lighting with the same archival print quality. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Beverly Hills event of any scale.",
)

add("west-hollywood",
    "West Hollywood Photo Booth Rental — Open-Air DSLR | Evergrain",
    "Open-air photo booth rental in West Hollywood. DSLR booth for rooftop weddings, brand launches, premiere parties — Sunset Strip to Pacific Design Center.",
    [
        "West Hollywood runs the design industry's east-side event calendar — Soho House WeHo, the West Hollywood EDITION, the Pendry, the London, the Andaz, the Sunset Tower, the Standard, the Pacific Design Center. The Sunset Strip's media houses and the Melrose-area agency offices anchor a serious brand-event calendar. Most of what we cover in WeHo leans creative, rooftop, and late-night.",
        "The booth's walnut-and-linen build reads as furniture against WeHo's design-forward hotel interiors. The DSLR sensor handles the dramatic mixed lighting these rooms specialize in — chandelier overhead, neon signage, mood-lit reception spaces.",
    ],
    [
        ("Rooftop Wedding & Reception Photo Booth", "Soho House WeHo rooftop weddings. EDITION pool-deck receptions. Sunset Tower private floor takeovers. Our wedding photo booth rental fits WeHo's design-forward scale. The walnut booth reads warm against modernist hotel interiors and the DSLR sensor handles mood lighting cleanly."),
        ("Brand Activations & Product Launches", "Sunset Strip media-house events. Melrose agency activations. Hotel suite takeovers for fashion launches. Our brand activation photo booth and product launch photo booth rental setups fit the WeHo creative-industry scale."),
        ("Film Premieres & Industry After-Parties", "Director's Guild premieres. After-parties at the Sunset Tower, the Edition, Soho House. Our film premiere photo booth rental and entertainment event photo booth rental setups bring custom welcome screens with the title card and branded strip templates."),
        ("Private Dining, Supper Clubs & Luxury Events", "San Vicente Bungalows. The Bird Streets. Sunset Tower's private floors. Our luxury photo booth rental and upscale party photo booth rental setups fit the design-forward intimate scale these venues specialize in."),
    ],
    "Why our open-air booth fits West Hollywood: the booth reads as furniture in any of WeHo's design-forward hotel interiors. The DSLR sensor handles dramatic mixed lighting — chandelier, neon, mood-lit — with the same archival print quality. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a WeHo creative event of any scale.",
)

add("culver-city",
    "Culver City Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Culver City. DSLR booth for studio wraps, modern weddings, brand events — Helms District to Sony Pictures.",
    [
        "Culver City is the design-meets-studio corner of the Westside. Sony Pictures. The Culver Studios. The Helms Bakery District. The Culver Hotel. The Wende Museum. A year-round mix of studio events, design-forward weddings, modern loft receptions, and brand activations for the agency offices headquartered around Washington Boulevard.",
        "The booth's walnut-and-linen build reads warm against the loft architecture that Culver City specializes in. The DSLR sensor handles the dramatic mixed lighting of soundstage-adjacent venues and loft receptions cleanly.",
    ],
    [
        ("Modern Wedding Photo Booth Rental", "Loft weddings in the Helms District. Culver Hotel ceremonies. Modern restaurant takeovers along Washington Boulevard. Our wedding photo booth rental fits Culver City's design-led scale."),
        ("Studio Wrap Parties & Industry Events", "Wrap parties at the Culver Studios. Sony Pictures private events. Our wrap party photo booth rental and entertainment event photo booth rental setups bring custom welcome screens featuring the show's title card and a rear-display reel."),
        ("Brand Activations & Product Launches", "Helms District showroom launches. Agency office events along Washington Boulevard. Our brand activation photo booth and product launch photo booth rental setups fit Culver City's design-forward aesthetic."),
        ("Corporate Events & Tech Launches", "The corporate and tech offices headquartered in Culver City run year-round events. Our corporate event photo booth rental setups bring custom welcome screens, branded strip templates, and a rear-display reel running your brand video."),
    ],
    "Why our open-air booth fits Culver City: the walnut frame reads warm against the loft architecture and the soundstage-adjacent venues that Culver City specializes in. The DSLR sensor handles dramatic mixed lighting cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Culver City studio or brand event of any scale.",
)

add("century-city",
    "Century City Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Luxury open-air photo booth rental in Century City. DSLR booth for hotel galas, awards ceremonies, corporate events — Fox Plaza to Westfield.",
    [
        "Century City is the Westside's corporate event corner — the high-rise hotel ballrooms, the Westfield Century City event spaces, the Annenberg School area, and the corporate offices clustered around Avenue of the Stars. Most events we cover here are corporate-formal — hotel galas, awards ceremonies, corporate retreats, financial-industry events.",
        "The booth's walnut-and-linen build reads as furniture in Century City's modernist hotel architecture. The DSLR sensor handles the dramatic chandelier lighting and floor-to-ceiling-window reflections these venues specialize in.",
    ],
    [
        ("Hotel Gala Photo Booth Rental", "Hyatt Regency Century Plaza ballroom galas. Fairmont Century Plaza events. Our gala photo booth rental and charity gala photo booth rental setups fit Century City's corporate-formal calendar."),
        ("Awards Ceremony Photo Booth Rental", "Industry awards events at the hotel ballrooms. Foundation events at the Annenberg-area venues. Our awards ceremony photo booth setups bring custom welcome screens and branded strip templates."),
        ("Corporate Conferences & Trade Events", "The hotel conference floors run year-round corporate conferences. Our corporate conference photo booth and conference photo booth rental setups bring custom welcome screens, branded strip templates, and a rear-display reel."),
        ("Wedding Photo Booth Rental in Century City", "Hotel ballroom weddings at the Hyatt Regency Century Plaza and the Fairmont. Our wedding photo booth rental fits Century City's formal scale."),
    ],
    "Why our open-air booth fits Century City: the booth reads as furniture in modernist hotel architecture. The DSLR sensor handles dramatic chandelier lighting and floor-to-ceiling-window reflections with the same archival print quality. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Century City corporate event of any scale.",
)

add("brentwood",
    "Brentwood Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Luxury open-air photo booth rental in Brentwood. DSLR booth for estate weddings, family events, charity galas — Getty area to San Vicente.",
    [
        "Brentwood is the Westside's quiet luxury residential neighborhood — estate weddings under sycamores, the Brentwood Country Club, the restaurants along San Vicente, and the year-round calendar of family weddings, milestone anniversaries, charity galas, bar/bat mitzvahs, and graduation parties. Most of what we cover here is intimate and formal.",
        "The booth's walnut-and-linen build reads as furniture in Brentwood's estate interiors and against the garden ceremonies these properties specialize in. The DSLR sensor handles the dramatic afternoon-into-evening lighting that estate weddings run on.",
    ],
    [
        ("Estate Wedding Photo Booth Rental", "Brentwood estate weddings under sycamores. Brentwood Country Club ceremonies and receptions. Private home receptions across the residential streets. Our wedding photo booth rental fits the formal-but-intimate scale Brentwood specializes in."),
        ("Bar Mitzvah & Bat Mitzvah Photo Booth", "Brentwood anchors a strong bar mitzvah and bat mitzvah calendar — Stephen Wise Temple, family home receptions, country club celebrations. Our event photo booth rental setups bring custom templates with the family's color story."),
        ("Charity Galas & Foundation Events", "Brentwood foundations and private estate galas. Our gala photo booth rental and charity gala photo booth rental setups fit the formal scale these events expect."),
        ("Milestone Anniversary & Family Photo Booth", "Brentwood families host beautiful milestone anniversary celebrations. Our milestone anniversary photo booth and anniversary party photo booth rental setups deliver custom templates and real prints."),
    ],
    "Why our open-air booth fits Brentwood: the booth reads as furniture in estate interiors and against garden ceremonies. The DSLR sensor handles afternoon-into-evening estate lighting with the same archival print quality. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Brentwood family event of any scale.",
)

add("pacific-palisades",
    "Pacific Palisades Photo Booth Rental — DSLR Open-Air | Evergrain",
    "Open-air photo booth rental in Pacific Palisades. DSLR booth for oceanfront weddings, family events, milestone celebrations — Palisades Village to PCH.",
    [
        "Pacific Palisades is the Westside's quietest coastal corner — oceanfront private homes, the Bel-Air Bay Club, Will Rogers State Historic Park, Palisades Village, and a year-round calendar of family weddings, milestone anniversaries, and intimate luxury events. Most of what we cover here is formal but family-rooted.",
        "The booth's walnut-and-linen build reads beautifully against the Spanish-Mediterranean architecture and oceanfront tented receptions Pacific Palisades specializes in. The DSLR sensor handles golden-hour ocean light and the dramatic indoor-outdoor reception transitions these venues feature.",
    ],
    [
        ("Oceanfront Wedding Photo Booth Rental", "Bel-Air Bay Club weddings. Private oceanfront home receptions. Will Rogers Ranch ceremonies. Our wedding photo booth rental fits the formal coastal scale Pacific Palisades specializes in."),
        ("Bridal Shower & Baby Shower Photo Booth", "Palisades Village restaurants. Backyard showers in the residential streets. Our bridal shower photo booth rental and baby shower photo booth rental setups bring custom templates and premium props."),
        ("Milestone Birthdays & Anniversary Photo Booth", "Family milestone celebrations at the Bel-Air Bay Club and at private oceanfront homes. Our milestone anniversary photo booth and birthday party photo booth setups deliver custom templates and real prints."),
        ("Private Dining & Luxury Events", "Palisades Village private dining. Intimate dinner parties at private oceanfront homes. Our luxury photo booth rental and private event photo booth rental setups fit the intimate scale these events run on."),
    ],
    "Why our open-air booth fits Pacific Palisades: the booth reads as furniture against Spanish-Mediterranean architecture and oceanfront tented receptions. The DSLR sensor handles golden-hour ocean light and indoor-outdoor reception transitions cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Pacific Palisades coastal event of any scale.",
)

add("playa-vista",
    "Playa Vista Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Playa Vista. DSLR booth for tech launches, modern weddings, brand events — Silicon Beach campuses.",
    [
        "Playa Vista is the Westside's Silicon Beach corner — the master-planned tech-campus neighborhood that anchors Google, YouTube, Microsoft, and dozens of agency offices along the coast. The Runway, the Reserve, and the smaller campus event spaces host year-round tech launches, brand activations, and corporate retreats. Master-planned residential streets host modern weddings and family events.",
        "The booth's walnut-and-linen build reads warm against the modern campus architecture Playa Vista runs on. The DSLR sensor handles the dramatic floor-to-ceiling daylight and modern interior lighting these venues specialize in.",
    ],
    [
        ("Tech Launches & Product Launch Photo Booth", "Google, YouTube, and the Silicon Beach campuses run year-round product launches. Our product launch photo booth rental and brand activation photo booth setups bring custom welcome screens, branded strip templates, and a rear-display reel running your launch video."),
        ("Corporate Event Photo Booth Rental", "Agency offices and tech campuses across Playa Vista run year-round corporate events. Our corporate event photo booth rental setups fit the campus-scale events these companies host."),
        ("Modern Wedding Photo Booth Rental", "Modern weddings at the master-planned residential venues. Our wedding photo booth rental fits the contemporary scale. Custom strip templates match modern minimalist invitation suites."),
        ("Office Parties & Company Christmas Photo Booth", "Playa Vista tech offices run a strong December calendar. Our office party photo booth rental and company Christmas party photo booth setups fit the campus-scale events these companies host."),
    ],
    "Why our open-air booth fits Playa Vista: the walnut frame reads warm against modern campus architecture and the floor-to-ceiling daylight these spaces specialize in. The DSLR sensor handles modern interior lighting cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Silicon Beach tech or brand event of any scale.",
)

add("westwood",
    "Westwood Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Westwood. DSLR booth for UCLA events, hotel galas, bar/bat mitzvahs — Hammer Museum to Wilshire.",
    [
        "Westwood anchors around UCLA and the surrounding university-area calendar — the Hammer Museum, the Geffen Playhouse, the W Los Angeles, the Hilton Universal, and a year-round mix of academic events, graduation parties, family weddings, bar/bat mitzvahs, and corporate events at the hotels along Wilshire.",
        "The booth's walnut-and-linen build reads as furniture in Westwood's academic-formal interiors and against hotel ballroom lighting. The DSLR sensor handles the dramatic chandelier and gallery-style lighting these venues specialize in.",
    ],
    [
        ("Graduation Party Photo Booth Rental", "UCLA graduations every spring drive a serious graduation party calendar. Our graduation party photo booth rental and college graduation party photo booth setups fit the family-celebration scale these events run on."),
        ("Bar Mitzvah & Bat Mitzvah Photo Booth", "Westwood anchors a strong bar mitzvah and bat mitzvah calendar — Sinai Temple, the Hammer Museum, and family receptions at the hotels along Wilshire. Our event photo booth rental setups bring custom templates with the family's color story."),
        ("Wedding Photo Booth Rental in Westwood", "Hotel ballroom weddings at the W Los Angeles and the Hilton Universal-adjacent venues. Hammer Museum ceremonies. Our wedding photo booth rental fits Westwood's academic-formal scale."),
        ("Foundation Galas & Cultural Events", "The Hammer Museum and the cultural venues around UCLA run a year-round gala calendar. Our gala photo booth rental and charity gala photo booth rental setups fit these formal rooms cleanly."),
    ],
    "Why our open-air booth fits Westwood: the booth reads as furniture in academic-formal interiors and against hotel ballroom lighting. The DSLR sensor handles dramatic chandelier and gallery-style lighting with the same archival print quality. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Westwood university or family event of any scale.",
)

add("sawtelle",
    "Sawtelle Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Sawtelle. DSLR booth for Japan-town cultural events, restaurant takeovers, intimate weddings.",
    [
        "Sawtelle is the Westside's Japan-town corridor — a year-round restaurant scene anchored by Tsujita, Hide Sushi, Nong La, and the smaller restaurants and shops that have made this corner one of LA's densest food blocks. Most events we cover here are intimate — restaurant takeovers, cultural celebrations, small weddings, milestone birthdays.",
        "The booth's walnut-and-linen build reads beautifully against Sawtelle's restaurant interiors. The DSLR sensor handles the warm restaurant lighting that anchors most events in this neighborhood.",
    ],
    [
        ("Restaurant Takeover & Private Event Photo Booth", "Tsujita private events. Hide Sushi celebrations. Restaurant takeovers along Sawtelle Boulevard. Our private event photo booth rental setups fit the intimate scale of restaurant private dining."),
        ("Intimate Wedding Photo Booth Rental", "Small-format weddings at restaurant venues and family backyards along Sawtelle. Our wedding photo booth rental fits the intimate scale. Custom strip templates that match a tight invitation suite."),
        ("Bachelorette, Bridal Shower & Baby Shower Photo Booth", "Sawtelle restaurant takeovers for showers and bachelorette dinners. Our bridal shower photo booth rental and bachelorette photo booth setups bring custom templates and a booth that doesn't crowd a tight table layout."),
        ("Cultural Events & Community Celebrations", "Sawtelle's cultural and community celebrations run year-round. Our event photo booth rental setups bring custom welcome screens and templates that match traditional or modern aesthetics."),
    ],
    "Why our open-air booth fits Sawtelle: the walnut frame reads beautifully against the warm restaurant interiors Sawtelle is built from. The DSLR sensor pulls clean prints under restaurant lighting that this neighborhood specializes in. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for the intimate restaurant-takeover events Sawtelle specializes in.",
)



add("arts-district",
    "Arts District Photo Booth Rental — Open-Air DSLR | Evergrain",
    "Open-air DSLR photo booth rental in the Arts District. Warehouse weddings, brand launches, gallery openings at Hauser & Wirth, ROW DTLA.",
    [
        "The Arts District is the warehouse heart of east downtown — concrete walls, exposed beams, and the gallery and brand scene built into them. Hauser & Wirth. Soho Warehouse. Hudson Loft. ROW DTLA. The Art Share LA building. Most events we cover here lean creative — warehouse weddings, brand launches, gallery openings, design-week activations.",
        "The booth's walnut-and-linen build reads dramatically warm against the concrete and steel these venues are built from. The DSLR sensor handles the high-contrast lighting that warehouse spaces specialize in. Custom strip templates can match the brutalist aesthetic or the curated minimalism of a designed event.",
    ],
    [
        ("Warehouse Wedding Photo Booth Rental", "Concrete-walled receptions at Hudson Loft. Industrial-chic ceremonies at the Millwick. Loft-style weddings across the Arts District. Our wedding photo booth rental fits the warehouse aesthetic — the walnut booth provides the warmth the concrete doesn't, and the DSLR sensor handles the dramatic mixed lighting these spaces specialize in."),
        ("Brand Activations & Product Launches", "ROW DTLA pop-ups. Hauser & Wirth special events. Soho Warehouse member nights. Our brand activation photo booth and product launch photo booth rental setups fit the Arts District's design-forward venues. Custom welcome screens, branded strip templates, looping rear-display reels playing your brand video."),
        ("Gallery Openings & Cultural Events", "Hauser & Wirth. The Geffen Contemporary. The smaller Arts District galleries that anchor the neighborhood's art calendar. Our event photo booth rental setups bring custom templates with the show's artist or color story and a booth that reads as part of the install."),
        ("Corporate Events & Creative Industry Parties", "Agency offices, fashion brand showrooms, and creative-industry studios across the Arts District run year-round events. Our corporate event photo booth rental and office party photo booth rental setups bring custom welcome screens, branded strip templates, and an attendant who reads a creative-industry crowd."),
    ],
    "Why our open-air booth fits the Arts District: the walnut frame reads warm against concrete and steel, providing the texture the architecture intentionally lacks. The DSLR sensor handles the high-contrast lighting these warehouse spaces specialize in. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for an Arts District event of any scale.",
)

add("chinatown",
    "Chinatown Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Chinatown LA. DSLR booth for plaza weddings, gallery openings, lantern-lit receptions — Central Plaza to Far East.",
    [
        "Chinatown is one of the most photographed neighborhoods in LA — Central Plaza's red lanterns, the Far East Plaza restaurant scene, the gallery row that anchors the western edge, and the late-night calendar that runs through Howlin' Ray's and the smaller bars and restaurants tucked into the alleys. Most events we cover here lean creative or cultural — gallery openings, plaza weddings, restaurant takeovers, brand activations.",
        "The booth's walnut-and-linen build reads beautifully against Chinatown's red-and-gold color story and against the bare-concrete gallery spaces along Chung King Road. The DSLR sensor handles the dramatic mixed lighting — lantern light, gallery overhead lighting, restaurant interiors.",
    ],
    [
        ("Wedding Photo Booth Rental in Chinatown", "Central Plaza ceremonies and receptions under the lanterns. Far East Plaza restaurant takeovers. Gallery weddings on Chung King Road. Our wedding photo booth rental fits Chinatown's mix of cultural and creative. Custom strip templates can match traditional red-and-gold color stories or contemporary minimalist invitation suites."),
        ("Gallery Openings & Cultural Events", "Chung King Road galleries run a year-round cultural calendar — solo openings, group shows, foundation events. Our event photo booth rental setups bring custom welcome screens with the show's artist and color story, and a booth that reads as part of the install."),
        ("Restaurant Takeovers & Milestone Birthdays", "Howlin' Ray's private events. Far East Plaza restaurant takeovers. Our birthday party photo booth and private event photo booth rental setups fit the tight scale of restaurant private dining."),
        ("Brand Activations & Cultural Brand Events", "Chinatown is one of LA's most photogenic backdrops for brand activations. Our brand activation photo booth and product launch photo booth rental setups fit the Plaza and gallery aesthetic cleanly."),
    ],
    "Why our open-air booth fits Chinatown: the walnut-and-linen build reads beautifully against red-and-gold cultural color stories and bare-concrete gallery spaces. The DSLR sensor handles lantern light, gallery overhead lighting, and restaurant interiors with the same archival print quality. Photo booth rental cost includes setup, attendant, prints, and the gallery — same pricing whether you're at Central Plaza or Chung King Road.",
)

add("mid-wilshire",
    "Mid-Wilshire Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air DSLR photo booth rental on Wilshire's museum row. LACMA, the Petersen, the Academy Museum — gala photo booth rental for the city's biggest fundraisers.",
    [
        "Mid-Wilshire is museum row — LACMA, the Petersen Automotive Museum, the Academy Museum, the Craft Contemporary, the Wallis Annenberg Center, and a stretch of Wilshire that runs gala season at scale year-round. Mid-Wilshire is also the Ebell, the Wiltern, the Park La Brea family neighborhood, and a strong wedding venue circuit anchored around the museums.",
        "Our open-air photo booth fits the formal scale of these venues. The walnut booth reads furniture-grade against LACMA's BCAM architecture and inside the Petersen's modern lines. The DSLR sensor handles the dramatic lighting that gala season specializes in — chandelier overheads, museum-display lighting, the Ebell's ballroom lighting.",
    ],
    [
        ("Museum Gala Photo Booth Rental", "LACMA, the Petersen, the Academy Museum, and the Wallis Annenberg Center all host year-round gala calendars. Our gala photo booth rental and charity gala photo booth rental setups fit these formal rooms cleanly. The walnut booth reads as furniture, the dye-sub prints look portrait-studio quality, and the attendant runs the line quietly while guests stay in conversation."),
        ("Wedding Photo Booth Rental in Mid-Wilshire", "Ebell ballroom weddings. Wiltern wedding receptions. Hotel ballroom weddings at the Park La Brea-adjacent properties. Our wedding photo booth rental fits Mid-Wilshire's formal scale. Custom strip templates match your invitation suite."),
        ("Awards Ceremonies & Foundation Events", "The Academy Museum, the Petersen, and the foundation event venues across Wilshire run a serious awards calendar. Our awards ceremony photo booth setups bring custom welcome screens, branded strip templates, and a rear-display reel."),
        ("Corporate Events & Brand Activations", "LACMA, the Petersen, and the museum row venues regularly host private corporate events and brand activations. Our brand activation photo booth setups fit these design-forward rooms cleanly."),
    ],
    "Why our open-air booth fits Mid-Wilshire: the booth reads furniture-grade in museum architecture, the DSLR sensor handles the dramatic lighting these venues specialize in, and the dye-sub prints look portrait-studio quality. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a museum-row gala, an Ebell wedding, or a corporate event at the Wallis Annenberg.",
)

add("larchmont",
    "Larchmont Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Larchmont Village. DSLR booth for intimate backyard weddings, milestone birthdays, baby showers, family events.",
    [
        "Larchmont Village is a small-town corner inside central LA — the boulevard's restaurant row, the family-rooted residential streets that wrap around it, and an event calendar that leans toward intimate, family-style celebrations. Backyard weddings. Milestone birthdays at restaurants. Baby showers at the village brunch spots. Anniversary dinners.",
        "Our open-air photo booth fits this scale. The walnut booth disappears into a backyard tented reception the same way it disappears into a restaurant private dining room. The DSLR sensor pulls clean prints under string lights and indoor restaurant warmth both.",
    ],
    [
        ("Backyard Wedding Photo Booth Rental", "Larchmont backyards host beautiful intimate weddings — string-lit ceremonies, family-style dinners under sycamores, and tented receptions. Our wedding photo booth rental fits the scale. The walnut booth reads warm against backyard lighting, and the DSLR sensor handles string-lit reception lighting cleanly."),
        ("Milestone Birthdays & Anniversary Photo Booth", "Larchmont restaurant takeovers for milestone birthdays — 30th, 40th, 50th. Our birthday party photo booth and milestone anniversary photo booth rental setups fit the intimate scale of restaurant private dining."),
        ("Bridal Shower & Baby Shower Photo Booth", "Village brunches. Restaurant private rooms. Backyard showers in the residential streets. Our bridal shower photo booth rental and baby shower photo booth rental setups bring custom templates, premium props, and a booth that fits a tight table layout."),
        ("Private Dining & Family Celebrations", "The Larchmont Village restaurant scene runs a year-round private dining calendar. Our private event photo booth rental setups bring custom templates and a booth that reads as part of the room."),
    ],
    "Why our open-air booth fits Larchmont: the booth is sized for a small room. It reads as furniture in restaurant private dining and in a backyard reception both. The DSLR sensor pulls clean prints in any of these lighting situations. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for the kind of intimate family-style event Larchmont specializes in.",
)

add("hancock-park",
    "Hancock Park Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Luxury open-air photo booth rental in Hancock Park. DSLR booth for estate weddings, bar/bat mitzvahs, charity galas, milestone events.",
    [
        "Hancock Park is the heart of old Hollywood's family neighborhood — the Wilshire Country Club, the Ebell of Los Angeles, the estate homes along Rossmore and Plymouth, and a year-round calendar of family weddings, bar mitzvahs, bat mitzvahs, anniversary parties, and charity galas. Most of what we cover here is formal and family-rooted.",
        "Our open-air photo booth was made for the kind of room Hancock Park specializes in — estate gardens, country-club ballrooms, family backyards under century-old trees. The walnut frame reads as furniture against the Ebell's tile and against the Wilshire Country Club's wood paneling. The DSLR sensor handles the formal ballroom lighting these events expect.",
    ],
    [
        ("Estate Wedding Photo Booth Rental", "Hancock Park estate weddings at the Ebell, the Wilshire Country Club, and the private estate homes that anchor the neighborhood. Our wedding photo booth rental fits the formal scale these events expect. The walnut booth reads as furniture against the period architecture, and the DSLR sensor handles ballroom chandelier lighting cleanly."),
        ("Bar Mitzvah & Bat Mitzvah Photo Booth", "Hancock Park anchors a strong bar mitzvah and bat mitzvah calendar — temple receptions at the major synagogues nearby and family receptions at the Ebell and the country club. Our event photo booth rental setups bring custom templates with the family's color story and the milestone date."),
        ("Charity Galas & Foundation Events", "The Ebell hosts a serious year-round gala calendar — foundation fundraisers, charity galas, awards dinners. Our gala photo booth rental and charity gala photo booth rental setups fit the room cleanly."),
        ("Milestone Anniversaries & Family Celebrations", "Hancock Park families host beautiful milestone anniversary celebrations — silver, gold, ruby. Our milestone anniversary photo booth setups bring real prints that grandparents will frame."),
    ],
    "Why our open-air booth fits Hancock Park: the walnut frame reads as furniture against period architecture — the Ebell's tile, the Wilshire Country Club's wood paneling, estate-home interiors. The DSLR sensor handles formal ballroom lighting these venues specialize in. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for the formal family events Hancock Park specializes in.",
)

add("thai-town",
    "Thai Town Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Thai Town LA. DSLR booth for cultural weddings, community celebrations, milestone events on east Hollywood Boulevard.",
    [
        "Thai Town runs along east Hollywood Boulevard — a dense restaurant and community calendar, year-round Songkran festival energy, and family-rooted celebrations that fill the neighborhood through every season. Most events we cover here are family or community-rooted — weddings, milestone birthdays, anniversary celebrations, cultural events.",
        "The booth's walnut-and-linen build reads warm against the restaurant interiors and family-style banquet halls that Thai Town runs on. Custom strip templates can match traditional color stories or contemporary invitation suites.",
    ],
    [
        ("Wedding Photo Booth Rental in Thai Town", "Restaurant takeovers along east Hollywood Boulevard. Family wedding receptions in the larger banquet halls that anchor Thai Town. Our wedding photo booth rental fits the family scale. Custom strip templates match traditional color stories or contemporary invitation suites."),
        ("Milestone Birthdays & Anniversary Celebrations", "Thai Town's deep family community hosts beautiful milestone celebrations — 50th anniversaries, milestone birthdays, family reunions. Our milestone anniversary photo booth and birthday party photo booth setups bring custom templates and real prints."),
        ("Cultural & Community Events", "Thai Town's year-round cultural calendar — Songkran festival events, temple celebrations, community fundraisers. Our event photo booth rental setups bring custom welcome screens and templates with the family or organization's color story."),
        ("Family Showers & Pre-Wedding Events", "Bridal showers, baby showers, and family pre-wedding celebrations at the restaurants and community spaces along Hollywood Boulevard. Our bridal shower photo booth rental and baby shower photo booth rental setups bring custom templates and a booth that fits a tight table layout."),
    ],
    "Why our open-air booth fits Thai Town: the walnut frame reads warm against restaurant interiors and family-style banquet halls. The DSLR sensor pulls clean prints in any of these lighting situations. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Thai Town family celebration of any scale.",
)

add("little-armenia",
    "Little Armenia Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Little Armenia LA. DSLR booth for multigenerational weddings, cultural celebrations, family milestones.",
    [
        "Little Armenia anchors east Hollywood with one of LA's deepest multigenerational communities — restaurants and bakeries that have been here for decades, family-rooted businesses, and a year-round calendar of weddings, baptisms, milestone anniversaries, and cultural celebrations. The Armenian community across Hollywood and Glendale shares venues — and we've covered events at most of them.",
        "Our open-air photo booth fits the scale these celebrations run at. The walnut-and-linen build reads warm against restaurant interiors and banquet hall lighting. The DSLR sensor pulls clean prints under any of the lighting situations these venues specialize in.",
    ],
    [
        ("Wedding Photo Booth Rental in Little Armenia", "Big multi-generational weddings at the Armenian banquet halls across Little Armenia and into Glendale. Our wedding photo booth rental fits the scale these events expect — large guest lists, long receptions, and a booth that delivers a real print every guest will frame."),
        ("Cultural Celebrations & Religious Milestones", "Baptisms, communions, and the cultural milestones that anchor the Armenian community calendar. Our event photo booth rental setups bring custom templates with the family's color story and the milestone date."),
        ("Milestone Anniversaries & Family Reunions", "Silver, gold, and ruby anniversaries that bring three or four generations of an Armenian family into one room. Our milestone anniversary photo booth setups deliver custom templates and real prints that the grandparents will frame."),
        ("Bridal Shower & Bachelorette Photo Booth", "Restaurant takeovers along Hollywood Boulevard. Backyard showers in the surrounding family neighborhoods. Our bridal shower photo booth rental and bachelorette photo booth setups fit the family scale."),
    ],
    "Why our open-air booth fits Little Armenia: the booth was built for the multi-generational family event where three generations are in the same room. Real DSLR prints that grandparents will frame. A walnut frame that reads as furniture in a banquet hall or in a backyard. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for an Armenian family wedding or anniversary celebration at any scale.",
)

add("virgil-village",
    "Virgil Village Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Virgil Village. DSLR booth for intimate weddings, dinner parties, brand activations, milestone events.",
    [
        "Virgil Village is the small east-side corner of LA that anchors around Sqirl, Courage Bagels, and the design-led restaurants along Virgil Avenue. The neighborhood runs on small-batch design — independent restaurants, lifestyle brand offices, small-format event venues. Most of what we cover here is intimate and creative.",
        "The booth's walnut-and-linen build matches the design vocabulary Virgil Village already runs on. The DSLR sensor handles the warm, indirect lighting that these design-forward restaurants specialize in. Custom strip templates that match the design of your invitation suite.",
    ],
    [
        ("Intimate Wedding Photo Booth Rental", "Restaurant takeovers along Virgil Avenue. Backyard receptions in the residential streets. Our wedding photo booth rental fits the intimate scale that Virgil Village specializes in. Custom strip templates match the design language your stationer set."),
        ("Dinner Parties & Private Events", "The design-led restaurants and small venues that anchor Virgil Village host year-round private events — milestone birthdays, engagement parties, supper-club-style dinners. Our private event photo booth rental and luxury photo booth rental setups fit the tight, designed scale of these rooms."),
        ("Brand Activations & Product Launches", "Lifestyle brand offices, indie publisher events, small-format brand activations. Our brand activation photo booth and product launch photo booth rental setups fit the design vocabulary cleanly."),
        ("Bridal Shower & Baby Shower Photo Booth", "Sqirl-style brunches, Courage Bagels restaurant takeovers, intimate backyard showers. Our bridal shower photo booth rental and baby shower photo booth rental setups bring custom templates and a booth that doesn't crowd a tight table layout."),
    ],
    "Why our open-air booth fits Virgil Village: the booth's design vocabulary — walnut wood, brushed linen, archival prints — matches the design vocabulary Virgil Village runs on. The DSLR sensor handles warm indirect restaurant lighting cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for the intimate, designed events Virgil Village specializes in.",
)



add("hollywood",
    "Hollywood Photo Booth Rental — Open-Air DSLR Booth | Evergrain",
    "Open-air DSLR photo booth rental in Hollywood — wrap parties, premieres, weddings, brand activations. From the Boulevard to the Bowl.",
    [
        "Hollywood is the neighborhood that built the camera into a way of life. The Walk of Fame, the TCL Chinese Theatre, the Hollywood Bowl, the Roosevelt, the Magic Castle — the venues here were photographed before they were even finished being built. Our open-air photo booth was made for rooms like these. The walnut frame reads as furniture against the Roosevelt poolside, against the Avalon's stage, against any rooftop event on the Strip.",
        "We've covered everything from late-night wrap parties at the El Capitan to red-carpet after-parties at the Dolby and intimate weddings at the Magic Castle. Hollywood events expect the room to be photographed, and our DSLR booth delivers prints that hold up next to professional event photography. Custom welcome screens, branded strip templates, an on-site attendant who knows how to run a line that includes both A-listers and their parents.",
    ],
    [
        ("Wrap Party Photo Booth Rental", "Wrap parties at the Roosevelt, Yamashiro, the Hollywood Roosevelt poolside, the Avalon. Our wrap party photo booth rental ships with custom welcome screens featuring the show's title card, branded photo strips, and a rear-display reel that runs the season's editor cut. Entertainment event photo booth rentals are some of our most frequent Hollywood bookings."),
        ("Film Premiere Photo Booth Rental & After-Parties", "Premiere after-parties at the El Capitan, the Egyptian, the Theatre at Ace Hotel. A film premiere photo booth rental adds a documented experience to the night — guests walk away with archival-quality prints and your team has shareable assets the next morning. Branded templates with the title treatment, color story, and release date."),
        ("Wedding Photo Booth Rental in Hollywood", "Magic Castle weddings. Yamashiro garden ceremonies. Roosevelt poolside receptions. Boutique hotel rooftop dinners. Our wedding photo booth rental fits Hollywood's mix of vintage and modern — the walnut frame reads beautifully against tile-roofed terraces and against minimalist downtown venues. Custom strip templates match your invitation suite."),
        ("Corporate Events & Brand Activations", "Sunset Strip media houses, Hollywood agency offices, and the production companies clustered between Vine and La Brea all run on brand activation events. Our brand activation photo booth setups bring custom welcome screens, looping rear-display reels running your brand video, and an online gallery delivered the morning after for press teams."),
    ],
    "Why our open-air photo booth rental works in Hollywood: every venue in this neighborhood has been photographed thousands of times. The booth doesn't compete with that history — it sits inside it. Real 24-megapixel DSLR sensor. Archival dye-sub prints. Walnut-and-linen build that reads as furniture against the Roosevelt's tile or the Dolby's modern lines. Our photo booth rental price covers setup, breakdown, attendant, prints, and online gallery, all in.",
)

add("los-feliz",
    "Los Feliz Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air DSLR photo booth rental in Los Feliz. Intimate weddings, milestone birthdays, anniversary parties — Griffith Park to Vermont Avenue.",
    [
        "Los Feliz is one of the quietest, most cinematic corners of central LA — the village that wraps around the base of Griffith Park, with the Greek Theatre on one side and the Observatory on the hilltop above. Vermont Avenue restaurants. Hillhurst's tree-lined streets. Restaurants that have been here for generations. Our open-air photo booth fits this kind of room — the walnut frame reads warm in the kind of small, lit-from-inside ceremonies that Los Feliz hosts year-round.",
        "Most of what we cover here is intimate. Backyard weddings under sycamores. Milestone birthdays at the Dresden. Anniversary dinners at L&E Oyster. Baby showers at Sqirl-style brunches. Pre-Greek-Theatre concerts and after-parties. The booth packs into two cases and disappears into the design of a small room the same way it does in a 300-person ballroom.",
    ],
    [
        ("Wedding Photo Booth Rental in Los Feliz", "Intimate Los Feliz weddings live in restaurant private rooms, family backyards, and the smaller venues tucked into the hillside. Our wedding photo booth rental fits the scale — a single photographer, a tight guest list, and a booth that reads as part of the room rather than against it. The DSLR sensor pulls clean prints out of warm restaurant lighting and string-lit backyard receptions."),
        ("Anniversary & Milestone Birthday Photo Booth", "10th anniversaries at the Dresden. 50th birthdays in a hillside home. Milestone anniversary photo booth setups across Los Feliz tend toward the intimate — a small guest list, a long dinner, and a booth that gives every guest a take-home print. Custom templates with the milestone date, the family color story, and your photographer's portrait of the couple."),
        ("Bridal Shower & Baby Shower Photo Booth", "Sqirl-style brunches. Backyard showers in the hills above Hillhurst. Our bridal shower photo booth rental and baby shower photo booth rental setups work in the kind of intimate room Los Feliz specializes in — custom templates, premium props, and a booth that doesn't crowd the table layout."),
        ("Private Dining & Restaurant Takeovers", "Little Dom's. L&E Oyster. The Dresden. Los Feliz restaurants take over beautifully for private events — birthdays, engagement parties, intimate corporate dinners. Our luxury photo booth rental and private event photo booth rental setups fit the scale and the lighting these rooms already have."),
    ],
    "Why our open-air booth fits Los Feliz: the booth is sized for a small room. It reads as furniture in restaurant private dining. The DSLR sensor pulls real depth-of-field out of dim, warm lighting that this kind of venue specializes in. Our photo booth rental cost includes setup, attendant, prints, and the online gallery — straightforward pricing for an intimate event where every detail already costs something.",
)

add("silver-lake",
    "Silver Lake Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Silver Lake. DSLR booth for creative weddings, brand events, milestone birthdays — Sunset Junction to the Reservoir.",
    [
        "Silver Lake is east-side LA's design-first neighborhood — the Reservoir, Sunset Junction, the Satellite, the small-batch coffee circuit, and a string of restaurants and shops that already photograph beautifully. Most events here lean creative. Independent weddings. Brand activations for design-led companies. Milestone birthdays at restaurants like Sqirl's spin-offs and Erewhon adjacencies. Our open-air photo booth was made for this kind of room.",
        "The booth's walnut-and-linen build matches the design vocabulary that Silver Lake already runs on — warm wood, soft fabric, real materials. The DSLR sensor handles the kind of moody, low-light evening reception this neighborhood loves. Custom strip templates that match your invitation suite. An on-site attendant who reads the room.",
    ],
    [
        ("Wedding Photo Booth Rental in Silver Lake", "Silver Lake weddings live in restaurant takeovers, small-venue receptions around Sunset Junction, and family backyards in the hills. Our wedding photo booth rental fits the design-first scale of these events. The walnut booth reads as furniture, the DSLR sensor handles low-light evening receptions cleanly, and the custom strip templates match the invitation suite your stationer already designed."),
        ("Brand Activations & Product Launches", "Silver Lake is small-batch and design-led — boutique stores, lifestyle brands, indie publishers, small breweries. A brand activation photo booth or product launch photo booth rental in Silver Lake fits the design vocabulary. Custom welcome screens, branded strip templates, looping rear-display reels playing your launch video."),
        ("Milestone Birthdays & Private Events", "30th birthdays at the Sunset Strip's east-side cousins. 40th birthdays in backyard dinners. Our birthday party photo booth and private event photo booth rental setups fit the intimate scale of Silver Lake celebrations. Custom templates, premium props, and a booth that reads as part of the design."),
        ("Bridal Shower & Bachelorette Photo Booth", "Restaurant private dining around Sunset Junction. Backyard showers in the hills. Our bridal shower photo booth rental and bachelorette photo booth setups in Silver Lake bring custom templates, premium props, and a booth that doesn't crowd a tight table layout."),
    ],
    "Why our open-air booth fits Silver Lake: the booth's design vocabulary — walnut wood, brushed linen, archival prints — matches the design vocabulary the neighborhood already runs on. The DSLR sensor handles the moody, low-light reception lighting that Silver Lake events love. Our luxury photo booth rental cost covers setup, attendant, prints, and the gallery — straightforward pricing for events where every detail is already considered.",
)

add("echo-park",
    "Echo Park Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air DSLR photo booth rental in Echo Park — lakeside weddings, warehouse parties, brand activations, milestone events.",
    [
        "Echo Park runs the east-side spectrum from the lake to the warehouses behind Sunset. Echo Park Lake itself anchors year-round outdoor events. The Echo and Echoplex run a strong live-music calendar that doubles as wedding and brand-event venue space. Sunset Boulevard restaurants take over for engagement parties and milestone birthdays. Our open-air photo booth has covered events at most of them.",
        "The booth's walnut-and-linen build photographs cleanly under string lights at a lakeside ceremony, against the concrete walls of a Sunset Boulevard warehouse, and inside a restaurant private dining room with edison-bulb lighting. The DSLR sensor delivers the same archival print quality in any of these rooms.",
    ],
    [
        ("Lakeside Wedding Photo Booth Rental", "Echo Park Lake ceremonies and the reception spaces around it. Our wedding photo booth rental handles the outdoor afternoon ceremony and the indoor evening reception the same way. Custom strip templates that match your invitation suite. The DSLR sensor pulls clean prints under afternoon sun and under string-lit reception lighting both."),
        ("Warehouse Weddings & Brand Activations", "Sunset Boulevard warehouses. The east-side spaces that anchor design-week activations and indie brand launches. Our warehouse wedding photo booth rental and brand activation photo booth setups work because the walnut booth reads warm against the concrete and metal these venues are built from."),
        ("Restaurant Takeovers & Milestone Birthdays", "Sunset Boulevard restaurants — milestone birthdays, engagement parties, anniversary dinners. Our birthday party photo booth and private event photo booth rental setups in Echo Park bring custom templates, premium props, and a booth that fits the tight scale of restaurant private dining."),
        ("Live-Music Venue Events", "The Echo, the Echoplex, and the smaller live-music venues around Sunset Boulevard run private events year-round. Our event photo booth rental setups bring custom welcome screens, branded strip templates, and an attendant who runs the line through a busy room."),
    ],
    "Why our open-air booth fits Echo Park: the booth handles lakeside outdoor ceremonies, warehouse parties, and restaurant private dining with the same archival print quality. Real DSLR sensor for low-light reception lighting. Walnut-and-linen build that reads as furniture in any of these rooms. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for an Echo Park event of any scale.",
)

add("koreatown",
    "Koreatown Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Koreatown. DSLR booth for art-deco galas, late-night corporate events, weddings, milestone birthdays.",
    [
        "Koreatown is one of LA's most photographed neighborhoods at night. The Wiltern. The Line Hotel. The HMS Bounty. The art-deco banquet halls along Wilshire. The late-night restaurant and bar scene that runs until 4 a.m. Most events we cover here happen at scale — large weddings, corporate end-of-year parties, brand activations that take over a full hotel floor. Our open-air photo booth fits the size of these rooms.",
        "The booth's walnut-and-linen build reads warm against K-town's art-deco architecture and against the modernist hotel ballrooms that anchor the neighborhood. The DSLR sensor handles the dramatic chandelier lighting that K-town venues specialize in. Custom strip templates match the formal scale these events expect.",
    ],
    [
        ("Wedding Photo Booth Rental in Koreatown", "Large family weddings at the Wiltern, the Line Hotel, and the major K-town banquet halls. Our wedding photo booth rental scales — from 100-guest restaurant takeovers to 500-guest ballroom weddings. Custom strip templates match your invitation suite. The DSLR sensor pulls clean prints out of dramatic chandelier lighting."),
        ("Hotel Galas & Awards Ceremonies", "The Line Hotel runs a serious year-round event calendar — black-tie galas, awards dinners, corporate celebrations. Our gala photo booth rental fits these rooms cleanly. The walnut booth reads furniture-grade against the modernist architecture, the dye-sub prints look portrait-studio quality, and the attendant runs the line quietly while guests stay in conversation."),
        ("Corporate Events, Brand Activations & Late-Night Parties", "K-town runs an incredible late-night corporate and brand-event calendar. Hotel takeovers at the Line. Wiltern after-parties. Office party photo booth rental setups for the agency offices and restaurant groups headquartered in the area. Custom welcome screens, branded strip templates, and a rear-display reel that runs your brand video all night."),
        ("Milestone Birthdays & Cultural Celebrations", "K-town hosts an enormous milestone celebration calendar — 30th birthdays, 50th anniversaries, doljabi celebrations. Our birthday party photo booth and milestone anniversary photo booth setups in Koreatown deliver real prints and custom templates with the milestone date and the family color story."),
    ],
    "Why our open-air booth fits Koreatown: the booth handles the dramatic, art-deco lighting that K-town venues specialize in. The DSLR sensor pulls clean prints in chandelier light. The walnut-and-linen build reads as furniture in any of K-town's hotel ballrooms or banquet halls. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a K-town event of any scale.",
)

add("downtown-los-angeles",
    "Downtown LA Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Luxury open-air DSLR photo booth rental in Downtown LA. Weddings at Vibiana, corporate galas, brand launches at The Broad. Hotel ballrooms.",
    [
        "Downtown LA is the city's densest event neighborhood. Vibiana. Hudson Loft. The NoMad. The Ace Hotel. The Millennium Biltmore. The California Club. The Broad. Walt Disney Concert Hall. Grand Central Market. Every block in DTLA has a venue that's been photographed thousands of times. Our open-air photo booth was made for this kind of density.",
        "The booth's walnut-and-linen build sits inside DTLA's mix of restored historic and aggressively modern architecture. The DSLR sensor handles the dramatic mixed lighting these venues specialize in — chandelier overheads, neon signage, concrete walls reflecting daylight. We've covered weddings, brand launches, hotel galas, and corporate events across most of the major DTLA venues.",
    ],
    [
        ("Wedding Photo Booth Rental in Downtown LA", "Vibiana weddings. Hudson Loft receptions. NoMad ballroom dinners. Millennium Biltmore galas. Our wedding photo booth rental in DTLA fits the formal scale these venues expect. Custom strip templates match your invitation suite. The DSLR sensor pulls portrait-quality prints out of dramatic mixed lighting."),
        ("Hotel Galas, Awards & Corporate Events", "The NoMad. The Ace Hotel. The Millennium Biltmore. The California Club. Our gala photo booth rental and corporate event photo booth rental setups fit DTLA's serious black-tie calendar. Awards ceremony photo booth setups for the legal, financial, and media industries based in DTLA are part of our regular calendar."),
        ("Brand Activations & Product Launches at The Broad / MOCA", "DTLA hosts a huge brand-activation calendar at venues including The Broad, MOCA, and ROW DTLA. A brand activation photo booth or product launch photo booth rental fits these design-forward rooms cleanly. Custom welcome screens, branded strip templates, and a rear-display reel running your brand video."),
        ("Conferences, Trade Shows & Corporate Events", "Conference photo booth rental and corporate conference photo booth setups at the JW Marriott, the InterContinental, the Westin Bonaventure, and the major DTLA hotel conference floors. Floor-level booths and after-hours receptions both. Custom welcome screens, branded strip templates, online gallery delivered the next morning."),
    ],
    "Why our open-air booth fits Downtown LA: the booth handles DTLA's mix of restored historic and aggressively modern architecture with the same archival print quality. Walnut-and-linen build that reads as furniture in any of these rooms. Real DSLR sensor that pulls clean prints out of dramatic mixed lighting. Photo booth rental cost includes setup, attendant, prints, and the gallery — same straightforward pricing whether you're searching for a wedding photo booth rental at Vibiana or a corporate event photo booth at the California Club.",
)

add("westlake",
    "Westlake Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Westlake. DSLR booth for community weddings, family celebrations, milestone events near MacArthur Park.",
    [
        "Westlake is the dense, family-rooted neighborhood that anchors west of Downtown — MacArthur Park, Wilshire Boulevard's eastern stretch, and a strong restaurant scene that runs from family-style banquet halls to neighborhood restaurants that have been here for generations. Most events we cover are family-rooted — weddings, quinceañeras, anniversary parties, milestone birthdays.",
        "The booth's walnut-and-linen build reads warm against the ballroom lighting and banquet hall architecture that Westlake specializes in. Custom strip templates match the formal scale these events expect.",
    ],
    [
        ("Wedding Photo Booth Rental in Westlake", "Westlake weddings tend toward the family-rooted — large guest lists, multi-generational receptions, ballroom or restaurant takeovers. Our wedding photo booth rental fits this scale. Custom strip templates match your invitation suite. The DSLR sensor pulls clean prints under ballroom chandelier lighting and warm restaurant interiors."),
        ("Quinceañera Photo Booth Rental", "Westlake hosts a strong quinceañera calendar at the banquet halls along Wilshire and at family backyards. Our quinceañera photo booth rental ships with custom templates in the family's color story — pink, white, gold, champagne. The walnut booth reads warm against the gowns and the ballroom lighting."),
        ("Milestone Anniversaries & Family Celebrations", "Westlake's deep multi-generational families host beautiful milestone anniversary celebrations — silver, gold, ruby. Our milestone anniversary photo booth and anniversary party photo booth rental setups bring real prints that grandparents will frame."),
        ("Community Events & Restaurant Takeovers", "Westlake restaurant takeovers for milestone birthdays, graduation parties, and family celebrations. Our private event photo booth rental and birthday party photo booth setups fit the intimate scale of restaurant private dining."),
    ],
    "Why our open-air booth fits Westlake: the booth was built for family events where three generations are in the same room. Real DSLR prints that grandparents will frame. A walnut frame that reads as furniture in a ballroom or a backyard. An attendant who runs the line so the host can host. Photo booth rental price stays straightforward — setup, breakdown, attendant, prints, and the gallery, all included.",
)

add("little-tokyo",
    "Little Tokyo Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Little Tokyo. DSLR booth for cultural weddings, gallery galas, garden ceremonies — JACCC Plaza to Aratani Theatre.",
    [
        "Little Tokyo is the cultural anchor of central LA — JACCC Plaza, the James Irvine Garden, the Aratani Theatre, the Museum of Contemporary Art Geffen, and a stretch of restaurants and shops that have been here for generations. Most events we cover in Little Tokyo blend cultural and modern — weddings that honor family traditions, gallery galas, lantern-lit garden ceremonies, anniversary celebrations.",
        "The booth's walnut-and-linen build pairs beautifully with Little Tokyo's design vocabulary — wood, paper, gardens. The DSLR sensor handles the soft, indirect lighting these venues specialize in. Custom strip templates can match traditional color stories or modern minimalist invitation suites.",
    ],
    [
        ("Wedding Photo Booth Rental in Little Tokyo", "Garden ceremonies at the James Irvine Garden. Banquet receptions at the JACCC. Restaurant takeovers across First Street. Our wedding photo booth rental in Little Tokyo fits the design and lighting of these venues. Custom strip templates match your invitation suite — traditional or modern."),
        ("Gallery & Cultural Galas", "MOCA Geffen, JACCC events, and the cultural foundations that anchor Little Tokyo run a year-round gala and benefit calendar. Our gala photo booth rental and charity gala photo booth rental setups fit these rooms cleanly. The walnut booth reads as furniture, the dye-sub prints look portrait-studio quality."),
        ("Anniversary & Milestone Family Celebrations", "Little Tokyo hosts beautiful multi-generational anniversary celebrations. Our milestone anniversary photo booth and anniversary party photo booth rental setups bring custom templates with the milestone date and the family color story."),
        ("Corporate Events & Brand Activations", "Little Tokyo's design-led restaurants and venues host a steady calendar of brand activations and corporate events. Our brand activation photo booth setups fit the design vocabulary cleanly — custom welcome screens, branded strip templates, looping rear-display reels."),
    ],
    "Why our open-air booth fits Little Tokyo: the booth's design vocabulary — walnut wood, brushed linen, archival prints — matches Little Tokyo's design vocabulary. The DSLR sensor handles the soft, indirect lighting these venues specialize in. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Little Tokyo event of any scale.",
)



# ============ SAN GABRIEL VALLEY (2/2) ============

add("covina",
    "Covina Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Covina. DSLR booth for historic-downtown weddings, family celebrations, milestone events.",
    [
        "Covina is the east SGV's historic-downtown community — the old town district along Citrus Avenue, family-rooted residential streets, and a year-round calendar of weddings, milestone anniversaries, quinceañeras, and graduation parties. Most of what we cover here is family-rooted and warm.",
        "The booth's walnut-and-linen build reads beautifully against Covina's historic-downtown venues and banquet hall interiors. The DSLR sensor handles warm restaurant lighting and ballroom chandelier interiors with the same archival print quality.",
    ],
    [
        ("Historic-Downtown Wedding Photo Booth Rental", "Old Town Covina venue weddings. Banquet hall receptions. Backyard weddings in the residential streets. Our wedding photo booth rental fits Covina's family-celebration scale."),
        ("Quinceañera Photo Booth Rental", "Covina quinceañeras at banquet halls and family backyards. Our quinceañera photo booth rental ships with custom templates in the family's color story. The walnut booth reads warm against the gowns."),
        ("Milestone Anniversary & Family Celebrations", "Covina families host beautiful multi-generational anniversary celebrations. Our milestone anniversary photo booth setups deliver custom templates and real prints."),
        ("Graduation Party & Birthday Photo Booth", "Covina graduation parties and milestone birthdays. Our graduation party photo booth rental and birthday party photo booth setups bring custom templates and real prints."),
    ],
    "Why our open-air booth fits Covina: the booth reads beautifully against historic-downtown venues and banquet hall interiors. The DSLR sensor pulls clean prints under warm restaurant lighting and ballroom chandeliers. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Covina family event of any scale.",
)

add("glendora",
    "Glendora Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Glendora. DSLR booth for citrus-country estate weddings, family celebrations, milestone events.",
    [
        "Glendora is the foothill SGV community known as the Pride of the Foothills — citrus-country estates, the historic Glendora Village, heritage oaks, and a year-round calendar of estate weddings, family celebrations, and milestone events. Most of what we cover here is family-rooted with a touch of foothill elegance.",
        "The booth's walnut-and-linen build reads beautifully against Glendora's heritage-oak estate venues. The DSLR sensor handles afternoon-into-evening estate lighting cleanly.",
    ],
    [
        ("Estate Wedding Photo Booth Rental", "Glendora citrus-country estate weddings under heritage oaks. Glendora Village venue ceremonies. Our wedding photo booth rental fits the foothill estate scale."),
        ("Milestone Anniversary & Family Photo Booth", "Glendora families host beautiful milestone anniversary celebrations. Our milestone anniversary photo booth setups deliver custom templates and real prints."),
        ("Graduation Party Photo Booth Rental", "Glendora and Citrus College graduation parties. Our graduation party photo booth rental setups bring custom templates and real prints."),
        ("Bridal Shower & Baby Shower Photo Booth", "Glendora Village restaurant brunches. Backyard showers under the heritage oaks. Our bridal shower photo booth rental and baby shower photo booth rental setups bring custom templates and premium props."),
    ],
    "Why our open-air booth fits Glendora: the booth reads beautifully against heritage-oak estate venues. The DSLR sensor handles afternoon-into-evening estate lighting cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Glendora family event of any scale.",
)

add("azusa",
    "Azusa Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Azusa. DSLR booth for foothills weddings, family celebrations, quinceañeras, milestone events.",
    [
        "Azusa sits at the foot of the San Gabriel Mountains — Azusa Pacific University, the foothills wedding venues with mountain views, family-rooted residential streets, and a year-round calendar of weddings, quinceañeras, graduation parties, and family celebrations.",
        "The booth's walnut-and-linen build reads warm against the foothills venues and family backyards Azusa specializes in. The DSLR sensor handles afternoon outdoor receptions and ballroom interiors with the same archival print quality.",
    ],
    [
        ("Foothills Wedding Photo Booth Rental", "Azusa foothills weddings with mountain views. Banquet hall receptions. Backyard weddings in the residential streets. Our wedding photo booth rental fits the family scale these events run on."),
        ("Quinceañera Photo Booth Rental", "Azusa quinceañeras at banquet halls and family backyards. Our quinceañera photo booth rental ships with custom templates in the family's color story. The walnut booth reads warm against the gowns."),
        ("Graduation Party Photo Booth Rental", "Azusa Pacific University graduation parties anchor a strong spring calendar. Our graduation party photo booth rental and college graduation party photo booth setups deliver custom templates and real prints."),
        ("Milestone Anniversary & Family Celebrations", "Azusa families host beautiful milestone anniversary celebrations. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
    ],
    "Why our open-air booth fits Azusa: the booth reads warm against foothills venues and family backyards. The DSLR sensor handles afternoon outdoor receptions and ballroom interiors cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for an Azusa family event of any scale.",
)

add("san-dimas",
    "San Dimas Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in San Dimas. DSLR booth for equestrian-country weddings, family celebrations, milestone events.",
    [
        "San Dimas is the SGV's western-heritage corner — equestrian-country estates, the historic San Dimas downtown, Frank G. Bonelli Regional Park, and a year-round calendar of ranch-style weddings, family celebrations, and milestone events. Most of what we cover here is family-rooted with a country feel.",
        "The booth's walnut-and-linen build reads beautifully against the ranch and equestrian venues San Dimas specializes in. The DSLR sensor handles afternoon-into-evening outdoor receptions cleanly.",
    ],
    [
        ("Equestrian-Country Wedding Photo Booth Rental", "San Dimas ranch-style weddings. Bonelli Park outdoor ceremonies. Historic downtown venue receptions. Our wedding photo booth rental fits the country-celebration scale. The walnut booth reads warm against the ranch architecture."),
        ("Family Celebrations & Milestone Anniversary Photo Booth", "San Dimas families host beautiful milestone anniversary celebrations. Our milestone anniversary photo booth setups deliver custom templates and real prints."),
        ("Quinceañera & Birthday Photo Booth", "San Dimas quinceañeras and milestone birthdays at family backyards and banquet venues. Our quinceañera photo booth rental and birthday party photo booth setups bring custom templates and real prints."),
        ("Graduation Party Photo Booth Rental", "San Dimas family graduation parties. Our graduation party photo booth rental setups deliver custom templates and real prints."),
    ],
    "Why our open-air booth fits San Dimas: the booth reads beautifully against ranch and equestrian venues. The DSLR sensor handles afternoon-into-evening outdoor receptions cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a San Dimas family event of any scale.",
)

add("la-verne",
    "La Verne Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in La Verne. DSLR booth for college-town weddings, vineyard estates, family celebrations.",
    [
        "La Verne is the SGV's college-town corner — the University of La Verne, the historic Old Town La Verne, vineyard-style estates, and a year-round calendar of weddings, graduation parties, family celebrations, and milestone events. Most of what we cover here has a quiet, polished feel.",
        "The booth's walnut-and-linen build reads beautifully against La Verne's vineyard estates and historic-downtown venues. The DSLR sensor handles afternoon-into-evening estate lighting cleanly.",
    ],
    [
        ("Vineyard Estate Wedding Photo Booth Rental", "La Verne vineyard-style estate weddings. Old Town La Verne venue ceremonies. Our wedding photo booth rental fits the quiet, polished scale La Verne specializes in."),
        ("College Graduation Party Photo Booth", "University of La Verne graduation parties anchor a strong spring calendar. Our graduation party photo booth rental and college graduation party photo booth setups deliver custom templates and real prints."),
        ("Milestone Anniversary & Family Photo Booth", "La Verne families host beautiful milestone anniversary celebrations. Our milestone anniversary photo booth setups deliver custom templates and real prints."),
        ("Bridal Shower & Baby Shower Photo Booth", "Old Town La Verne restaurant brunches. Backyard showers in the residential streets. Our bridal shower photo booth rental and baby shower photo booth rental setups bring custom templates and premium props."),
    ],
    "Why our open-air booth fits La Verne: the booth reads beautifully against vineyard estates and historic-downtown venues. The DSLR sensor handles afternoon-into-evening estate lighting cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a La Verne event of any scale.",
)

add("rowland-heights",
    "Rowland Heights Photo Booth Rental — DSLR Open-Air | Evergrain",
    "Open-air photo booth rental in Rowland Heights. DSLR booth for cultural wedding banquets, family celebrations at scale.",
    [
        "Rowland Heights is one of the SGV's largest Asian-American communities — big banquet halls, multi-course wedding dinners, and a year-round calendar of cultural weddings, milestone celebrations, and family events at serious scale.",
        "The booth's walnut-and-linen build reads warm against banquet hall ballroom interiors. The DSLR sensor handles dramatic chandelier interiors and the formal scale these events expect.",
    ],
    [
        ("Cultural Wedding Banquet Photo Booth Rental", "Big multi-course wedding banquets at the family banquet halls across Rowland Heights. Our wedding photo booth rental scales — from 200-guest restaurants to 600-guest ballroom receptions. Custom strip templates match the formal scale."),
        ("Milestone Anniversary & Family Celebrations", "Multi-generational anniversary celebrations across Rowland Heights. Our milestone anniversary photo booth setups deliver custom templates and real prints that grandparents will frame."),
        ("Cultural Celebrations & Community Events", "Lunar New Year celebrations, Mid-Autumn festivals, and cultural foundation events. Our event photo booth rental setups bring custom templates."),
        ("Quinceañera & Family Photo Booth", "Rowland Heights' broader family community hosts quinceañeras and milestone family celebrations. Our quinceañera photo booth rental setups bring custom templates and real prints."),
    ],
    "Why our open-air booth fits Rowland Heights: the booth scales to formal banquet hall ballroom interiors. Real DSLR prints. A walnut frame that reads as furniture. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Rowland Heights wedding banquet of any scale.",
)

add("hacienda-heights",
    "Hacienda Heights Photo Booth Rental — DSLR Open-Air | Evergrain",
    "Open-air photo booth rental in Hacienda Heights. DSLR booth for hilltop estate weddings, multigenerational family celebrations.",
    [
        "Hacienda Heights is the hilltop family community of the southeast SGV — Hsi Lai Temple, hilltop estates, family-rooted residential streets, and a year-round calendar of multigenerational weddings, milestone anniversaries, and cultural celebrations.",
        "The booth's walnut-and-linen build reads warm against hilltop estate interiors and banquet hall venues. The DSLR sensor handles afternoon-into-evening hillside lighting and ballroom chandeliers with the same archival print quality.",
    ],
    [
        ("Hilltop Estate Wedding Photo Booth Rental", "Hacienda Heights hilltop estate weddings with views. Banquet hall receptions. Our wedding photo booth rental fits the multigenerational family scale these events run on."),
        ("Cultural Wedding & Banquet Photo Booth", "Big multi-course wedding banquets at the family banquet halls. Our wedding photo booth rental scales for the formal cultural banquets Hacienda Heights specializes in."),
        ("Milestone Anniversary & Family Celebrations", "Hacienda Heights families host beautiful multi-generational anniversary celebrations. Our milestone anniversary photo booth setups deliver custom templates and real prints."),
        ("Quinceañera & Family Photo Booth", "Hacienda Heights quinceañeras and milestone family celebrations. Our quinceañera photo booth rental setups bring custom templates and real prints."),
    ],
    "Why our open-air booth fits Hacienda Heights: the booth reads warm against hilltop estate interiors and banquet hall venues. The DSLR sensor handles hillside and ballroom lighting cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Hacienda Heights family event of any scale.",
)

add("diamond-bar",
    "Diamond Bar Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Diamond Bar. DSLR booth for country club weddings, master-planned community galas, family events.",
    [
        "Diamond Bar is the master-planned hilltop community at the SGV's southeast edge — the Diamond Bar Center, country club venues, hilltop estates, and a year-round calendar of weddings, family galas, milestone anniversaries, and corporate events.",
        "The booth's walnut-and-linen build reads as furniture in country club ballrooms and the Diamond Bar Center's event spaces. The DSLR sensor handles dramatic ballroom chandelier lighting and hilltop outdoor receptions with the same archival print quality.",
    ],
    [
        ("Country Club Wedding Photo Booth Rental", "Diamond Bar Center weddings with city-light views. Country club ceremonies and receptions. Our wedding photo booth rental fits the master-planned formal scale Diamond Bar specializes in."),
        ("Family Galas & Corporate Events", "Diamond Bar Center galas and corporate events. Our gala photo booth rental and corporate event photo booth rental setups fit the formal scale these events expect."),
        ("Milestone Anniversary & Family Celebrations", "Diamond Bar families host beautiful milestone anniversary celebrations. Our milestone anniversary photo booth setups deliver custom templates and real prints."),
        ("Quinceañera & Graduation Photo Booth", "Diamond Bar quinceañeras and graduation parties at the community venues and family homes. Our quinceañera photo booth rental and graduation party photo booth rental setups bring custom templates and real prints."),
    ],
    "Why our open-air booth fits Diamond Bar: the booth reads as furniture in country club ballrooms and the Diamond Bar Center. The DSLR sensor handles ballroom chandelier lighting and hilltop outdoor receptions cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Diamond Bar event of any scale.",
)

add("claremont",
    "Claremont Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Claremont. DSLR booth for college-town weddings, garden ceremonies, family celebrations — the Claremont Colleges.",
    [
        "Claremont is the SGV's college-town jewel — the Claremont Colleges, the tree-lined Claremont Village, Rancho Santa Ana Botanic Garden, and a year-round calendar of garden weddings, college graduation parties, and intimate family celebrations under century-old trees.",
        "The booth's walnut-and-linen build reads beautifully against Claremont's garden venues and historic-village interiors. The DSLR sensor handles afternoon garden light and string-lit evening receptions cleanly.",
    ],
    [
        ("Garden Wedding Photo Booth Rental in Claremont", "Rancho Santa Ana Botanic Garden ceremonies. Claremont Village venue receptions. Garden weddings under century-old trees. Our wedding photo booth rental fits the intimate garden scale Claremont specializes in."),
        ("College Graduation Party Photo Booth", "The Claremont Colleges — Pomona, CMC, Scripps, Harvey Mudd, Pitzer — anchor a serious graduation calendar every spring. Our graduation party photo booth rental and college graduation party photo booth setups deliver custom templates and real prints."),
        ("Bridal Shower & Baby Shower Photo Booth", "Claremont Village restaurant brunches. Backyard showers under the trees. Our bridal shower photo booth rental and baby shower photo booth rental setups bring custom templates and premium props."),
        ("Milestone Anniversary & Family Photo Booth", "Claremont families host beautiful milestone anniversary celebrations. Our milestone anniversary photo booth setups deliver custom templates and real prints."),
    ],
    "Why our open-air booth fits Claremont: the booth reads beautifully against garden venues and historic-village interiors. The DSLR sensor handles afternoon garden light and string-lit evening receptions cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Claremont college-town or family event of any scale.",
)

# ============ SOUTHEAST LOS ANGELES (9) ============

add("downey",
    "Downey Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Downey. DSLR booth for big-family weddings, quinceañeras, milestone celebrations — Rio Hondo to Stonewood.",
    [
        "Downey is the anchor of Southeast LA's family-celebration scene — the Rio Hondo Event Center, the Embassy Suites Downey, family-owned banquet halls, and a year-round calendar of big-family weddings, quinceañeras, milestone anniversaries, and graduation parties that run until the dance floor empties out past midnight.",
        "The booth's walnut-and-linen build reads warm against banquet hall ballroom interiors and family backyards. The DSLR sensor handles dramatic chandelier lighting and afternoon outdoor receptions with the same archival print quality.",
    ],
    [
        ("Big-Family Wedding Photo Booth Rental", "Downey's banquet halls and event centers host weddings with wide guest lists and dance floors that run past midnight. Our wedding photo booth rental fits the scale — and the photo strip becomes a real keepsake for the grandparents and the cousins both."),
        ("Quinceañera Photo Booth Rental", "This is one of our biggest event categories in Downey. Quinceañera photo booth rental setups at the Rio Hondo Event Center, banquet halls, and family backyards. Custom templates with the quinceañera's name and color story — pink, white, gold, champagne, royal blue."),
        ("Milestone Anniversary & Family Celebrations", "Silver, gold, and ruby anniversaries that bring three or four generations of a Downey family into one room. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
        ("Graduation Party & Birthday Photo Booth", "Downey graduation parties and milestone birthdays at family homes and banquet venues. Our graduation party photo booth rental and birthday party photo booth setups bring custom templates and real prints."),
    ],
    "Why our open-air booth fits Downey: the booth was built for the kind of big-family event where three generations are in the same room. Real DSLR prints that grandparents will frame. A walnut frame that reads as furniture in a banquet hall or a backyard. An attendant who runs the line so the host can host. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Downey family celebration of any scale.",
)

add("whittier",
    "Whittier Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Whittier. DSLR booth for historic-downtown weddings, college events, family celebrations — Uptown to Whittier College.",
    [
        "Whittier is Southeast LA's historic-downtown community — Uptown Whittier, Whittier College, the historic Greenleaf Avenue district, and a year-round calendar of family weddings, college graduation parties, milestone anniversaries, and quinceañeras with serious community roots.",
        "The booth's walnut-and-linen build reads beautifully against Whittier's historic-downtown venues and banquet hall interiors. The DSLR sensor handles warm restaurant lighting and ballroom chandeliers with the same archival print quality.",
    ],
    [
        ("Historic-Downtown Wedding Photo Booth Rental", "Uptown Whittier venue weddings. Greenleaf Avenue restaurant takeovers. Banquet hall receptions. Our wedding photo booth rental fits Whittier's family-celebration scale with serious roots."),
        ("College Graduation Party Photo Booth", "Whittier College and Rio Hondo College anchor a strong graduation calendar every spring. Our graduation party photo booth rental and college graduation party photo booth setups deliver custom templates and real prints."),
        ("Quinceañera & Milestone Family Photo Booth", "Whittier quinceañeras at banquet halls and family backyards. Our quinceañera photo booth rental ships with custom templates in the family's color story. Milestone anniversary photo booth setups for the multi-generational families."),
        ("Bridal Shower & Baby Shower Photo Booth", "Uptown Whittier restaurant brunches. Backyard showers in the historic residential streets. Our bridal shower photo booth rental and baby shower photo booth rental setups bring custom templates and premium props."),
    ],
    "Why our open-air booth fits Whittier: the booth reads beautifully against historic-downtown venues and banquet hall interiors. The DSLR sensor pulls clean prints under warm restaurant lighting and ballroom chandeliers. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Whittier family event of any scale.",
)

add("norwalk",
    "Norwalk Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Norwalk. DSLR booth for community weddings, quinceañeras, big-family celebrations.",
    [
        "Norwalk is one of Southeast LA's most community-rooted neighborhoods — family-owned banquet halls, the Norwalk Arts & Sports Complex, Cerritos College nearby, and a year-round calendar of weddings, quinceañeras, milestone anniversaries, and graduation parties where it feels like the whole neighborhood showed up.",
        "The booth's walnut-and-linen build reads warm against banquet hall ballroom interiors and family backyards. The DSLR sensor handles dramatic chandelier lighting and afternoon outdoor receptions with the same archival print quality.",
    ],
    [
        ("Community Wedding Photo Booth Rental", "Norwalk weddings fill the banquet halls and family backyards — wide guest lists, long receptions, and a dance floor that runs all night. Our wedding photo booth rental fits the community-celebration scale."),
        ("Quinceañera Photo Booth Rental", "Norwalk quinceañeras at banquet halls and family backyards. Our quinceañera photo booth rental ships with custom templates in the family's color story. The walnut booth reads warm against the gowns."),
        ("Milestone Anniversary & Family Celebrations", "Norwalk families host beautiful multi-generational anniversary celebrations. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
        ("Graduation Party Photo Booth Rental", "Cerritos College graduation parties anchor a strong spring calendar. Our graduation party photo booth rental setups bring custom templates and real prints."),
    ],
    "Why our open-air booth fits Norwalk: the booth was built for the community celebration where the whole neighborhood shows up. Real DSLR prints. A walnut frame that reads as furniture in a banquet hall or a backyard. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Norwalk family event of any scale.",
)

add("cerritos",
    "Cerritos Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Cerritos. DSLR booth for modern weddings, performing-arts-center galas, corporate events.",
    [
        "Cerritos is Southeast LA's modern suburban anchor — the Cerritos Center for the Performing Arts, the Sheraton Cerritos, modern banquet venues, and a year-round calendar of polished weddings, corporate galas, milestone celebrations, and cultural events. Most of what we cover here has crisp suburban polish.",
        "The booth's walnut-and-linen build reads as furniture in the Cerritos Center's modern event spaces and hotel ballrooms. The DSLR sensor handles dramatic chandelier lighting and modern interior lighting with the same archival print quality.",
    ],
    [
        ("Modern Wedding Photo Booth Rental", "Cerritos Center weddings. Sheraton Cerritos ballroom receptions. Modern banquet venue ceremonies. Our wedding photo booth rental fits the crisp suburban polish Cerritos specializes in."),
        ("Performing Arts Center Galas & Corporate Events", "The Cerritos Center for the Performing Arts hosts a year-round gala and corporate event calendar. Our gala photo booth rental and corporate event photo booth rental setups fit these formal rooms cleanly."),
        ("Cultural Wedding Banquet Photo Booth", "Cerritos hosts a strong calendar of Asian and Indian wedding banquets. Our wedding photo booth rental scales for the formal banquets these venues specialize in. Custom strip templates match the formal scale."),
        ("Milestone Anniversary & Family Photo Booth", "Cerritos families host beautiful milestone anniversary celebrations. Our milestone anniversary photo booth setups deliver custom templates and real prints."),
    ],
    "Why our open-air booth fits Cerritos: the booth reads as furniture in the Cerritos Center's modern event spaces and hotel ballrooms. The DSLR sensor handles dramatic chandelier lighting and modern interiors cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Cerritos event of any scale.",
)

add("lakewood",
    "Lakewood Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Lakewood. DSLR booth for family-style weddings, country club events, milestone celebrations.",
    [
        "Lakewood is the Southeast LA suburban family community — the Lakewood Country Club, the Lakewood Center, family-rooted residential streets, and a year-round calendar of family-style weddings, milestone anniversaries, graduation parties, and community celebrations.",
        "The booth's walnut-and-linen build reads as furniture in country club ballrooms and family backyards. The DSLR sensor handles ballroom chandelier lighting and outdoor afternoon receptions with the same archival print quality.",
    ],
    [
        ("Country Club Wedding Photo Booth Rental", "Lakewood Country Club weddings. Family-style banquet hall receptions. Backyard weddings in the residential streets. Our wedding photo booth rental fits the family-celebration scale."),
        ("Milestone Anniversary & Family Celebrations", "Lakewood families host beautiful multi-generational anniversary celebrations. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
        ("Graduation Party & Birthday Photo Booth", "Lakewood graduation parties and milestone birthdays at the country club and family homes. Our graduation party photo booth rental and birthday party photo booth setups bring custom templates and real prints."),
        ("Bridal Shower & Baby Shower Photo Booth", "Lakewood restaurant brunches and backyard showers in the residential streets. Our bridal shower photo booth rental and baby shower photo booth rental setups bring custom templates and premium props."),
    ],
    "Why our open-air booth fits Lakewood: the booth reads as furniture in country club ballrooms and family backyards. The DSLR sensor handles ballroom chandelier lighting and outdoor afternoon receptions cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Lakewood family event of any scale.",
)

add("bellflower",
    "Bellflower Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Bellflower. DSLR booth for multigenerational weddings, quinceañeras, family celebrations full of music.",
    [
        "Bellflower is the music-filled family heart of Southeast LA — family-owned banquet halls, the Bellflower Civic Center, and a year-round calendar of multigenerational weddings, quinceañeras, milestone anniversaries, and family celebrations where the dance floor never empties.",
        "The booth's walnut-and-linen build reads warm against banquet hall ballroom interiors and family backyards. The DSLR sensor handles dramatic chandelier lighting and afternoon outdoor receptions with the same archival print quality.",
    ],
    [
        ("Multigenerational Wedding Photo Booth Rental", "Bellflower weddings fill the banquet halls with music and wide guest lists. Our wedding photo booth rental fits the family-celebration scale — and the photo strip becomes a keepsake for every generation in the room."),
        ("Quinceañera Photo Booth Rental", "Bellflower quinceañeras at banquet halls and family backyards. Our quinceañera photo booth rental ships with custom templates in the family's color story. The walnut booth reads warm against the gowns."),
        ("Milestone Anniversary & Family Celebrations", "Bellflower families host beautiful multi-generational anniversary celebrations. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
        ("Birthday & Gender Reveal Photo Booth", "Bellflower milestone birthdays and gender reveals at family homes and banquet venues. Our birthday party photo booth and gender reveal photo booth rental setups — the rear-display reel can run a build-up slideshow leading to the reveal moment."),
    ],
    "Why our open-air booth fits Bellflower: the booth was built for the music-filled, multi-generational family event. Real DSLR prints. A walnut frame that reads as furniture in a banquet hall or a backyard. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Bellflower family celebration of any scale.",
)

add("pico-rivera",
    "Pico Rivera Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Pico Rivera. DSLR booth for family weddings, quinceañeras, milestone celebrations rooted in the community.",
    [
        "Pico Rivera is one of Southeast LA's most community-rooted neighborhoods — the Pico Rivera Sports Arena, family-owned banquet halls, and a year-round calendar of family weddings, quinceañeras, religious milestones, and multi-generational celebrations.",
        "The booth's walnut-and-linen build reads warm against banquet hall ballroom interiors and family backyards. The DSLR sensor handles dramatic chandelier lighting and afternoon outdoor receptions with the same archival print quality.",
    ],
    [
        ("Family Wedding Photo Booth Rental", "Pico Rivera weddings fill the banquet halls and family backyards with wide guest lists and long receptions. Our wedding photo booth rental fits the community-celebration scale."),
        ("Quinceañera Photo Booth Rental", "This is one of our biggest event categories in Pico Rivera. Quinceañera photo booth rental setups at banquet halls and family backyards. Custom templates with the quinceañera's name and color story."),
        ("Religious Milestones & Cultural Celebrations", "Baptisms, communions, and the religious milestones that anchor Pico Rivera's Catholic family calendar. Our event photo booth rental setups bring custom templates with the family's color story."),
        ("Milestone Anniversary & Family Celebrations", "Pico Rivera families host beautiful multi-generational anniversary celebrations. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
    ],
    "Why our open-air booth fits Pico Rivera: the booth was built for the community celebration rooted in this corner of LA. Real DSLR prints. A walnut frame that reads as furniture in a banquet hall or a backyard. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Pico Rivera family event of any scale.",
)

add("montebello",
    "Montebello Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Montebello. DSLR booth for hillside weddings, family celebrations, quinceañeras, milestone events.",
    [
        "Montebello is the hillside family community of Southeast LA — the Quiet Cannon event center with golf-course views, the Montebello Country Club, family-owned banquet halls, and a year-round calendar of weddings, quinceañeras, milestone anniversaries, and family celebrations with serious character.",
        "The booth's walnut-and-linen build reads warm against the hillside venue interiors and country club ballrooms Montebello specializes in. The DSLR sensor handles dramatic chandelier lighting and golf-course-view outdoor receptions with the same archival print quality.",
    ],
    [
        ("Hillside Wedding Photo Booth Rental", "Quiet Cannon weddings with golf-course views. Montebello Country Club ceremonies and receptions. Our wedding photo booth rental fits the hillside family-celebration scale Montebello specializes in."),
        ("Quinceañera Photo Booth Rental", "Montebello quinceañeras at the Quiet Cannon, banquet halls, and family backyards. Our quinceañera photo booth rental ships with custom templates in the family's color story. The walnut booth reads warm against the gowns."),
        ("Milestone Anniversary & Family Celebrations", "Montebello families host beautiful multi-generational anniversary celebrations. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
        ("Graduation Party & Birthday Photo Booth", "Montebello graduation parties and milestone birthdays. Our graduation party photo booth rental and birthday party photo booth setups bring custom templates and real prints."),
    ],
    "Why our open-air booth fits Montebello: the booth reads warm against hillside venue interiors and country club ballrooms. The DSLR sensor handles dramatic chandelier lighting and golf-course-view outdoor receptions cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Montebello family event of any scale.",
)

add("paramount",
    "Paramount Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Paramount. DSLR booth for community weddings, quinceañeras, family celebrations that pack the dance floor.",
    [
        "Paramount is one of Southeast LA's tightest-knit family communities — family-owned banquet halls, the Paramount Park venues, and a year-round calendar of weddings, quinceañeras, milestone anniversaries, and celebrations that pack the dance floor from the first song to the last.",
        "The booth's walnut-and-linen build reads warm against banquet hall ballroom interiors and family backyards. The DSLR sensor handles dramatic chandelier lighting and afternoon outdoor receptions with the same archival print quality.",
    ],
    [
        ("Community Wedding Photo Booth Rental", "Paramount weddings fill the banquet halls and family backyards with wide guest lists and dance floors that run all night. Our wedding photo booth rental fits the community-celebration scale."),
        ("Quinceañera Photo Booth Rental", "Paramount quinceañeras at banquet halls and family backyards. Our quinceañera photo booth rental ships with custom templates in the family's color story. The walnut booth reads warm against the gowns."),
        ("Milestone Anniversary & Family Celebrations", "Paramount families host beautiful multi-generational anniversary celebrations. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
        ("Birthday & Family Celebration Photo Booth", "Paramount milestone birthdays, gender reveals, and family celebrations. Our birthday party photo booth and private event photo booth rental setups bring custom templates and real prints."),
    ],
    "Why our open-air booth fits Paramount: the booth was built for the tight-knit community celebration that packs the dance floor. Real DSLR prints. A walnut frame that reads as furniture in a banquet hall or a backyard. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Paramount family event of any scale.",
)

# ============ SOUTH BAY (8) ============

add("long-beach",
    "Long Beach Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air DSLR photo booth rental in Long Beach. Weddings, convention galas, aquarium events, conferences — Queen Mary to the Convention Center.",
    [
        "Long Beach is the South Bay's event powerhouse — the Long Beach Convention Center, the Aquarium of the Pacific, the Queen Mary, the Hyatt Regency Long Beach, the Westin, and a waterfront skyline that becomes the photo backdrop itself. A year-round calendar of weddings, conventions, corporate galas, and conferences runs through the harbor.",
        "The booth's walnut-and-linen build reads as furniture against the Queen Mary's art-deco interiors and inside the modern convention-center event spaces. The DSLR sensor handles dramatic skyline-backdrop lighting and ballroom chandeliers with the same archival print quality.",
    ],
    [
        ("Harbor-Side Wedding Photo Booth Rental", "Queen Mary weddings with one of the most photographed backdrops in California. Hotel rooftop receptions at the Hyatt Regency and the Westin. Aquarium of the Pacific galas. Our wedding photo booth rental fits the waterfront formal scale Long Beach specializes in."),
        ("Conferences & Trade Show Photo Booth Rental", "The Long Beach Convention Center is one of California's most-used conference venues. Our corporate conference photo booth and trade show photo booth rental setups bring custom welcome screens, branded strip templates, and a rear-display reel — floor-level booths and after-hours receptions both."),
        ("Hotel Galas, Awards & Corporate Events", "Long Beach hosts a serious gala calendar — the Performing Arts Center, the Aquarium event spaces, the Queen Mary. Our gala photo booth rental and corporate event photo booth rental setups fit these rooms cleanly."),
        ("Quinceañera & Family Celebrations", "Long Beach's larger banquet halls host quinceañeras and family celebrations year-round. Our quinceañera photo booth rental ships in white, gold, or champagne color stories on the templates."),
    ],
    "Why our open-air booth fits Long Beach: the booth handles the Queen Mary's art-deco interiors, modern convention-center spaces, and skyline-backdrop receptions with the same archival print quality. Walnut-and-linen build that reads as furniture in any of these rooms. Photo booth rental cost includes setup, attendant, prints, and the gallery — same straightforward pricing whether you're searching for a wedding photo booth rental on the Queen Mary or a corporate conference photo booth for the Convention Center.",
)

add("manhattan-beach",
    "Manhattan Beach Photo Booth Rental — DSLR Open-Air | Evergrain",
    "Luxury open-air photo booth rental in Manhattan Beach. DSLR booth for beach-club weddings, oceanfront receptions, milestone events.",
    [
        "Manhattan Beach is the South Bay's casual-luxury anchor — the Manhattan Country Club, Shade Hotel, Verandas Beach House, the pier, and a year-round calendar of beach-club weddings, oceanfront receptions, milestone birthdays, and corporate events that lean into the golden hour.",
        "The booth's walnut-and-linen build reads beautifully against coastal venues and beach-club interiors. The DSLR sensor handles golden-hour ocean light and tented beachfront receptions with the same archival print quality.",
    ],
    [
        ("Beach-Club Wedding Photo Booth Rental", "Manhattan Country Club weddings. Verandas Beach House oceanfront receptions. Shade Hotel ceremonies. Our wedding photo booth rental leans into the golden hour — the walnut booth reads warm against the coastal light and the DSLR sensor handles tented beachfront receptions cleanly."),
        ("Milestone Birthdays & Anniversary Photo Booth", "40th birthdays at the Manhattan Country Club. 50th birthdays at Shade Hotel rooftops. Our milestone anniversary photo booth and birthday party photo booth setups deliver custom templates and real prints."),
        ("Bachelorette, Bridal Shower & Baby Shower Photo Booth", "Manhattan Beach restaurants, the pier rooftops, beachfront homes. Our bachelorette photo booth, bridal shower photo booth rental, and baby shower photo booth rental setups run heavy through the summer here."),
        ("Corporate Events & Holiday Parties", "Manhattan Beach finance and tech offices run a strong corporate calendar. Our corporate event photo booth rental and holiday party photo booth rental setups at Shade Hotel and the country club are typical bookings."),
    ],
    "Why our open-air booth fits Manhattan Beach: the booth reads beautifully against coastal venues and beach-club interiors. The DSLR sensor handles golden-hour ocean light and tented beachfront receptions cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Manhattan Beach event of any scale.",
)

add("hermosa-beach",
    "Hermosa Beach Photo Booth Rental — DSLR Open-Air | Evergrain",
    "Open-air photo booth rental in Hermosa Beach. DSLR booth for pier-side weddings, beach celebrations, milestone birthdays.",
    [
        "Hermosa Beach is the South Bay's most laid-back coastal corner — the Hermosa Pier, the beach-volleyball courts, the Strand, and a year-round calendar of pier-side weddings, beach celebrations, milestone birthdays, and bachelorette weekends.",
        "The booth's walnut-and-linen build reads warm against the casual coastal venues Hermosa specializes in. The DSLR sensor handles golden-hour beach light and string-lit evening receptions cleanly.",
    ],
    [
        ("Pier-Side Wedding Photo Booth Rental", "Hermosa pier-side ceremonies. Beach-volleyball-courtyard weddings. Strand-front receptions. Our wedding photo booth rental fits the casual coastal scale Hermosa specializes in."),
        ("Bachelorette & Bridal Shower Photo Booth", "Hermosa is a bachelorette-weekend favorite. Pier-side restaurants, beach houses, rooftop patios. Our bachelorette photo booth and bridal shower photo booth rental setups run heavy through the summer."),
        ("Milestone Birthdays & Beach Celebrations", "Hermosa milestone birthdays and beach celebrations. Our birthday party photo booth and private event photo booth rental setups deliver custom templates and real prints."),
        ("Corporate & Holiday Party Photo Booth", "Hermosa's restaurant and hospitality groups run a strong corporate calendar. Our corporate event photo booth rental and holiday party photo booth rental setups fit the casual coastal scale."),
    ],
    "Why our open-air booth fits Hermosa Beach: the booth reads warm against casual coastal venues. The DSLR sensor handles golden-hour beach light and string-lit evening receptions cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Hermosa Beach event of any scale.",
)

add("redondo-beach",
    "Redondo Beach Photo Booth Rental — DSLR Open-Air | Evergrain",
    "Open-air photo booth rental in Redondo Beach. DSLR booth for harbor weddings, pier events, family beach gatherings.",
    [
        "Redondo Beach is the South Bay's harbor-front community — the Redondo Beach Pier, King Harbor, the Portofino Hotel, and a year-round calendar of harbor weddings, pier events, family beach gatherings, and milestone celebrations.",
        "The booth's walnut-and-linen build reads beautifully against harbor-front venues and hotel interiors. The DSLR sensor handles golden-hour harbor light and ballroom interiors with the same archival print quality.",
    ],
    [
        ("Harbor Wedding Photo Booth Rental", "Portofino Hotel harbor-front weddings. Redondo Beach Historic Library ceremonies. Pier-side receptions. Our wedding photo booth rental fits the harbor-front family-celebration scale Redondo specializes in."),
        ("Family Beach Gatherings & Milestone Birthdays", "Redondo family beach gatherings and milestone birthdays. Our birthday party photo booth and milestone anniversary photo booth setups deliver custom templates and real prints."),
        ("Bridal Shower & Bachelorette Photo Booth", "Harbor-front restaurant brunches. Beach-house bachelorette weekends. Our bridal shower photo booth rental and bachelorette photo booth setups run through the summer here."),
        ("Corporate Events & Holiday Parties", "Redondo's harbor venues host year-round corporate events and holiday parties. Our corporate event photo booth rental and holiday party photo booth rental setups fit the harbor-front scale."),
    ],
    "Why our open-air booth fits Redondo Beach: the booth reads beautifully against harbor-front venues and hotel interiors. The DSLR sensor handles golden-hour harbor light and ballroom interiors cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Redondo Beach event of any scale.",
)

add("torrance",
    "Torrance Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Torrance. DSLR booth for country club weddings, hotel galas, corporate events, family celebrations.",
    [
        "Torrance is the South Bay's largest community — the Torrance Cultural Arts Center, the Toyota corporate campus, hotel ballrooms, country club venues, and a year-round calendar of weddings, hotel galas, corporate events, and family celebrations at scale.",
        "The booth's walnut-and-linen build reads as furniture in country club ballrooms and hotel event spaces. The DSLR sensor handles dramatic chandelier lighting and modern corporate interiors with the same archival print quality.",
    ],
    [
        ("Country Club Wedding Photo Booth Rental", "Torrance country club weddings. Hotel ballroom receptions. Cultural Arts Center ceremonies. Our wedding photo booth rental fits the formal South Bay scale Torrance specializes in."),
        ("Hotel Galas & Corporate Events", "Torrance hotel ballroom galas. Toyota campus corporate events. Our gala photo booth rental and corporate event photo booth rental setups fit these formal rooms cleanly. Awards ceremony photo booth setups for the South Bay business community."),
        ("Cultural Wedding Banquet Photo Booth", "Torrance has a strong Japanese-American community and hosts cultural wedding banquets year-round. Our wedding photo booth rental scales for these formal banquets."),
        ("Quinceañera & Family Celebrations", "Torrance's larger banquet halls host quinceañeras and family celebrations. Our quinceañera photo booth rental ships with custom templates in the family's color story."),
    ],
    "Why our open-air booth fits Torrance: the booth reads as furniture in country club ballrooms and hotel event spaces. The DSLR sensor handles dramatic chandelier lighting and modern corporate interiors cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Torrance event of any scale.",
)

add("el-segundo",
    "El Segundo Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in El Segundo. DSLR booth for tech-campus activations, modern brand launches, small-downtown weddings.",
    [
        "El Segundo is the South Bay's tech and aerospace corner — the Mattel campus, the dozens of tech and aerospace offices, the small but charming downtown, and a year-round calendar of brand activations, corporate events, product launches, and intimate downtown weddings.",
        "The booth's walnut-and-linen build reads warm against modern campus architecture and the historic downtown venues. The DSLR sensor handles modern interior lighting and warm restaurant interiors with the same archival print quality.",
    ],
    [
        ("Tech-Campus Activations & Product Launches", "El Segundo tech and aerospace campuses run year-round product launches and brand activations. Our brand activation photo booth and product launch photo booth rental setups bring custom welcome screens, branded strip templates, and a rear-display reel running your launch video."),
        ("Corporate Events & Office Parties", "El Segundo's corporate community runs a strong year-round event calendar. Our corporate event photo booth rental and office party photo booth rental setups fit the campus-scale events these companies host. Company Christmas party photo booth setups in December."),
        ("Small-Downtown Wedding Photo Booth Rental", "El Segundo's charming downtown hosts intimate weddings at the smaller venues and restaurants. Our wedding photo booth rental fits the intimate scale."),
        ("Brand Events & Experiential Marketing", "El Segundo brand offices host experiential marketing events year-round. Our experiential marketing photo booth setups fit the design-forward scale these brands expect."),
    ],
    "Why our open-air booth fits El Segundo: the walnut frame reads warm against modern campus architecture and historic downtown venues. The DSLR sensor handles modern interior lighting and warm restaurant interiors cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for an El Segundo tech, brand, or wedding event of any scale.",
)

add("palos-verdes-estates",
    "Palos Verdes Photo Booth Rental — Luxury Open-Air | Evergrain",
    "Luxury open-air photo booth rental in Palos Verdes Estates. DSLR booth for cliffside weddings, ocean-view estates, milestone celebrations.",
    [
        "Palos Verdes Estates is the South Bay's cliffside luxury corner — Wayfarers Chapel, the Trump National Golf Club, the Palos Verdes Golf Club, ocean-view estates, and a year-round calendar of cliffside weddings, country club galas, and milestone family celebrations with serious old-California pedigree.",
        "The booth's walnut-and-linen build reads as furniture against cliffside venue interiors and country club ballrooms. The DSLR sensor handles golden-hour ocean light and dramatic ballroom chandeliers with the same archival print quality.",
    ],
    [
        ("Cliffside Wedding Photo Booth Rental", "Wayfarers Chapel ceremonies. Trump National Golf Club ocean-view receptions. Palos Verdes Golf Club weddings. Our luxury photo booth rental and wedding photo booth rental setups fit the cliffside formal scale Palos Verdes specializes in."),
        ("Country Club Galas & Charity Events", "Palos Verdes country club galas and charity events. Our gala photo booth rental and charity gala photo booth rental setups fit the formal ocean-view scale these events expect."),
        ("Milestone Anniversary & Family Celebrations", "Palos Verdes families host beautiful milestone anniversary celebrations at the country clubs and ocean-view estates. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
        ("Bridal Shower & Luxury Private Events", "Ocean-view estate showers. Country club private dining. Our bridal shower photo booth rental and luxury photo booth rental setups fit the formal scale these events run on."),
    ],
    "Why our open-air booth fits Palos Verdes: the booth reads as furniture against cliffside venue interiors and country club ballrooms. The DSLR sensor handles golden-hour ocean light and dramatic ballroom chandeliers cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Palos Verdes luxury event of any scale.",
)

add("san-pedro",
    "San Pedro Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in San Pedro. DSLR booth for harbor-front weddings, warehouse venues, maritime-character celebrations.",
    [
        "San Pedro is the South Bay's working-harbor neighborhood — the Port of Los Angeles, the historic downtown, the CRAFTED warehouse venues, Point Fermin, and a year-round calendar of harbor-front weddings, warehouse receptions, and family celebrations with maritime character.",
        "The booth's walnut-and-linen build reads warm against the warehouse venues and harbor-front interiors San Pedro specializes in. The DSLR sensor handles dramatic high-contrast warehouse lighting and golden-hour harbor light with the same archival print quality.",
    ],
    [
        ("Harbor-Front Wedding Photo Booth Rental", "San Pedro harbor-front weddings. Point Fermin ceremonies. CRAFTED warehouse receptions. Our wedding photo booth rental fits the maritime-character scale San Pedro specializes in."),
        ("Warehouse Venue & Brand Events", "CRAFTED at the Port of LA and the historic downtown warehouse venues. Our warehouse wedding photo booth rental and brand activation photo booth setups work because the walnut booth provides the warmth the concrete and steel don't."),
        ("Family Celebrations & Milestone Events", "San Pedro family weddings, quinceañeras, and milestone celebrations. Our wedding photo booth rental and quinceañera photo booth rental setups fit the family scale."),
        ("Cultural & Community Celebrations", "San Pedro's strong Croatian, Italian, and Portuguese communities host cultural celebrations year-round. Our event photo booth rental setups bring custom templates with the family's color story."),
    ],
    "Why our open-air booth fits San Pedro: the walnut frame reads warm against warehouse venues and harbor-front interiors. The DSLR sensor handles high-contrast warehouse lighting and golden-hour harbor light cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a San Pedro event of any scale.",
)

# ============ ORANGE COUNTY (12) ============

add("anaheim",
    "Anaheim Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air DSLR photo booth rental in Anaheim. Convention activations, hotel galas, big-family weddings — Convention Center to Disneyland Resort.",
    [
        "Anaheim is Orange County's event powerhouse — the Anaheim Convention Center (one of the largest in the country), the Disneyland Resort hotels, the Honda Center, the Anaheim Packing District, and a year-round calendar of conventions, brand activations, big-family weddings, and hotel galas at serious scale.",
        "The booth's walnut-and-linen build reads as furniture in convention-center concourses and resort-hotel ballrooms. The DSLR sensor handles dramatic chandelier lighting and modern convention interiors with the same archival print quality.",
    ],
    [
        ("Convention & Trade Show Photo Booth Rental", "The Anaheim Convention Center runs a packed annual calendar. Our corporate conference photo booth and trade show photo booth rental setups bring custom welcome screens, branded strip templates, and a rear-display reel — floor-level booths and after-hours receptions both."),
        ("Hotel Galas & Brand Activations", "Disneyland Resort hotel galas. Anaheim Packing District brand activations. Our gala photo booth rental and brand activation photo booth setups fit these rooms cleanly. Product launch photo booth rental setups for the convention-adjacent brand calendar."),
        ("Big-Family Wedding Photo Booth Rental", "Anaheim hotel ballroom weddings and family banquet receptions at scale. Our wedding photo booth rental fits the big-family OC scale — wide guest lists, long receptions."),
        ("Quinceañera & Cultural Celebrations", "Anaheim hosts a serious quinceañera calendar at banquet halls and hotel ballrooms. Our quinceañera photo booth rental ships in white, gold, or champagne color stories on the templates."),
    ],
    "Why our open-air booth fits Anaheim: the booth handles convention-center concourses, resort-hotel ballrooms, and big-family banquet receptions with the same archival print quality. Walnut-and-linen build that reads as furniture in any of these rooms. Photo booth rental cost includes setup, attendant, prints, and the gallery — same straightforward pricing whether you're searching for a corporate conference photo booth for the Convention Center or a wedding photo booth rental at a Disneyland Resort hotel.",
)

add("irvine",
    "Irvine Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Irvine. DSLR booth for corporate galas, master-planned weddings, tech launches, conferences.",
    [
        "Irvine is Orange County's master-planned corporate hub — the Irvine Spectrum, the corporate campuses, the Hotel Irvine, the Marriott, UC Irvine, and a year-round calendar of corporate galas, modern weddings, tech launches, and conferences with crisp California polish.",
        "The booth's walnut-and-linen build reads as furniture in Irvine's modern hotel ballrooms and corporate event spaces. The DSLR sensor handles dramatic chandelier lighting and modern interior lighting with the same archival print quality.",
    ],
    [
        ("Corporate Galas & Conference Photo Booth", "Irvine's corporate campuses and hotels run a year-round gala and conference calendar. Our gala photo booth rental, corporate conference photo booth, and corporate event photo booth rental setups fit these formal rooms cleanly."),
        ("Modern Wedding Photo Booth Rental", "Hotel Irvine weddings. Marriott ballroom receptions. Master-planned venue ceremonies. Our wedding photo booth rental fits Irvine's modern California polish."),
        ("Tech Launches & Brand Activations", "Irvine's tech campuses run year-round product launches and brand activations. Our brand activation photo booth and product launch photo booth rental setups bring custom welcome screens and branded strip templates."),
        ("Bar Mitzvah, Bat Mitzvah & Family Celebrations", "Irvine has a strong bar/bat mitzvah scene at University Synagogue and Temple Beth Sholom. Our event photo booth rental setups bring custom templates with the family's color story."),
    ],
    "Why our open-air booth fits Irvine: the booth reads as furniture in modern hotel ballrooms and corporate event spaces. The DSLR sensor handles dramatic chandelier lighting and modern interiors cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for an Irvine corporate, wedding, or brand event of any scale.",
)

add("santa-ana",
    "Santa Ana Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Santa Ana. DSLR booth for historic-downtown weddings, artist-studio events, quinceañeras, cultural celebrations.",
    [
        "Santa Ana is Orange County's cultural heart — the historic downtown, the Santa Ana Arts District, the Bowers Museum, the Yost Theater, and a year-round calendar of historic-downtown weddings, artist-studio events, quinceañeras, and culturally rich family celebrations.",
        "The booth's walnut-and-linen build reads beautifully against the historic-downtown venues and artist-studio spaces Santa Ana specializes in. The DSLR sensor handles dramatic mixed lighting — gallery overheads, restaurant interiors, ballroom chandeliers.",
    ],
    [
        ("Historic-Downtown Wedding Photo Booth Rental", "Santa Ana Arts District loft weddings. Yost Theater receptions. Historic-downtown venue ceremonies. Our wedding photo booth rental fits Santa Ana's culturally rich, design-forward scale."),
        ("Quinceañera Photo Booth Rental", "Santa Ana hosts one of OC's deepest quinceañera calendars. Our quinceañera photo booth rental ships with custom templates in the family's color story — pink, white, gold, champagne. The walnut booth reads warm against the gowns."),
        ("Artist-Studio & Gallery Events", "Bowers Museum events. Arts District gallery openings. Our event photo booth rental and brand activation photo booth setups fit the design-forward aesthetic Santa Ana specializes in."),
        ("Cultural Celebrations & Milestone Family Events", "Santa Ana's culturally rich community hosts year-round celebrations. Our milestone anniversary photo booth and event photo booth rental setups bring custom templates with the family's color story."),
    ],
    "Why our open-air booth fits Santa Ana: the booth reads beautifully against historic-downtown venues and artist-studio spaces. The DSLR sensor handles dramatic mixed lighting cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Santa Ana cultural or family event of any scale.",
)

add("fullerton",
    "Fullerton Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Fullerton. DSLR booth for college-town weddings, downtown venues, family celebrations — Cal State Fullerton.",
    [
        "Fullerton is Orange County's college-town anchor — Cal State Fullerton, Fullerton College, the historic downtown, the Muckenthaler Cultural Center, and a year-round calendar of college graduation parties, downtown weddings, and family-rooted celebrations.",
        "The booth's walnut-and-linen build reads beautifully against the historic-downtown venues and cultural center interiors Fullerton specializes in. The DSLR sensor handles warm restaurant lighting and garden-ceremony light with the same archival print quality.",
    ],
    [
        ("College Graduation Party Photo Booth", "Cal State Fullerton and Fullerton College anchor a serious graduation calendar every spring. Our graduation party photo booth rental and college graduation party photo booth setups deliver custom templates and real prints."),
        ("Downtown & Historic Wedding Photo Booth Rental", "Muckenthaler Cultural Center weddings. Historic downtown Fullerton venue receptions. Our wedding photo booth rental fits Fullerton's family-celebration scale."),
        ("Quinceañera & Family Celebrations", "Fullerton quinceañeras at banquet halls and family backyards. Our quinceañera photo booth rental ships with custom templates in the family's color story."),
        ("Milestone Anniversary & Family Photo Booth", "Fullerton families host beautiful milestone anniversary celebrations. Our milestone anniversary photo booth setups deliver custom templates and real prints."),
    ],
    "Why our open-air booth fits Fullerton: the booth reads beautifully against historic-downtown venues and cultural-center interiors. The DSLR sensor handles warm restaurant lighting and garden-ceremony light cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Fullerton college-town or family event of any scale.",
)

add("orange",
    "Orange Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Orange CA. DSLR booth for Old Towne weddings, garden ceremonies, intimate family celebrations.",
    [
        "Orange is Orange County's antique-and-charm corner — the historic Old Towne Orange traffic circle, Chapman University, the antique district, and a year-round calendar of historic-venue weddings, garden ceremonies, and intimate family celebrations.",
        "The booth's walnut-and-linen build reads beautifully against Old Towne Orange's historic interiors and garden venues. The DSLR sensor handles warm restaurant lighting and afternoon garden light with the same archival print quality.",
    ],
    [
        ("Old Towne Wedding Photo Booth Rental", "Old Towne Orange historic-venue weddings. Garden ceremonies in the residential streets. Chapman University event-space receptions. Our wedding photo booth rental fits the historic-charm scale Orange specializes in."),
        ("Garden Ceremony & Intimate Wedding Photo Booth", "Intimate garden weddings across Orange. Our wedding photo booth rental fits the small-format scale. Custom strip templates match your invitation suite."),
        ("College Graduation Party Photo Booth", "Chapman University graduation parties anchor a strong spring calendar. Our graduation party photo booth rental and college graduation party photo booth setups deliver custom templates and real prints."),
        ("Bridal Shower & Baby Shower Photo Booth", "Old Towne Orange restaurant brunches. Backyard showers in the historic streets. Our bridal shower photo booth rental and baby shower photo booth rental setups bring custom templates and premium props."),
    ],
    "Why our open-air booth fits Orange: the booth reads beautifully against Old Towne's historic interiors and garden venues. The DSLR sensor handles warm restaurant lighting and afternoon garden light cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for an Orange historic or family event of any scale.",
)

add("costa-mesa",
    "Costa Mesa Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Costa Mesa. DSLR booth for design-district brand events, galas, modern weddings — South Coast Plaza to the Segerstrom.",
    [
        "Costa Mesa is Orange County's design-and-arts corner — South Coast Plaza, the Segerstrom Center for the Arts, the Lab and the Camp, the OC Fairgrounds, and a year-round calendar of design-district activations, black-tie galas, and modern weddings with serious creative direction.",
        "The booth's walnut-and-linen build reads as furniture in Costa Mesa's design-forward venues and the Segerstrom's modern interiors. The DSLR sensor handles dramatic gallery and ballroom lighting with the same archival print quality.",
    ],
    [
        ("Brand Activations & Product Launches", "South Coast Plaza pop-ups. The Lab and the Camp design-district activations. OC Fairgrounds brand events. Our brand activation photo booth and product launch photo booth rental setups fit Costa Mesa's design-forward aesthetic cleanly."),
        ("Galas & Awards at the Segerstrom Center", "The Segerstrom Center for the Arts, the Center Club, and the Costa Mesa hotel ballrooms run a serious black-tie calendar. Our gala photo booth rental and charity gala photo booth rental setups fit these formal rooms cleanly."),
        ("Modern Wedding Photo Booth Rental", "Costa Mesa modern weddings with serious creative direction. Our wedding photo booth rental fits the design-forward scale. Custom strip templates match modern minimalist invitation suites."),
        ("Conferences & Corporate Events", "OC Fairgrounds and hotel conference floors run year-round corporate events. Our conference photo booth rental and corporate event photo booth rental setups bring custom welcome screens and branded strip templates."),
    ],
    "Why our open-air booth fits Costa Mesa: the booth reads as furniture in design-forward venues and the Segerstrom's modern interiors. The DSLR sensor handles dramatic gallery and ballroom lighting cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Costa Mesa design, gala, or wedding event of any scale.",
)

add("huntington-beach",
    "Huntington Beach Photo Booth Rental — DSLR Open-Air | Evergrain",
    "Open-air photo booth rental in Huntington Beach. DSLR booth for beachfront weddings, surf-town receptions, California-casual celebrations.",
    [
        "Huntington Beach is Orange County's surf-town anchor — Surf City USA, the HB Pier, the Waterfront Beach Resort, Pasea Hotel, Paséa, and a year-round calendar of beachfront weddings, surf-town receptions, and California-casual celebrations.",
        "The booth's walnut-and-linen build reads warm against beachfront resort interiors and the casual coastal venues Huntington specializes in. The DSLR sensor handles golden-hour beach light and tented oceanfront receptions with the same archival print quality.",
    ],
    [
        ("Beachfront Wedding Photo Booth Rental", "Waterfront Beach Resort weddings. Pasea Hotel oceanfront receptions. HB Pier-area ceremonies. Our wedding photo booth rental leans into the California-casual scale Huntington specializes in — golden-hour ceremonies, tented beachfront receptions."),
        ("Bachelorette, Bridal Shower & Baby Shower Photo Booth", "Huntington Beach is a bachelorette-weekend favorite. Beachfront resort pool decks, surf-town restaurants, beach houses. Our bachelorette photo booth and bridal shower photo booth rental setups run heavy through the summer."),
        ("Corporate Events & Brand Activations", "Huntington Beach resort venues host year-round corporate events and surf-brand activations. Our corporate event photo booth rental and brand activation photo booth setups fit the casual coastal scale."),
        ("Milestone Birthdays & Family Celebrations", "Huntington milestone birthdays and family beach gatherings. Our birthday party photo booth and milestone anniversary photo booth setups deliver custom templates and real prints."),
    ],
    "Why our open-air booth fits Huntington Beach: the booth reads warm against beachfront resort interiors and casual coastal venues. The DSLR sensor handles golden-hour beach light and tented oceanfront receptions cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Huntington Beach event of any scale.",
)

add("newport-beach",
    "Newport Beach Photo Booth Rental — Luxury Open-Air | Evergrain",
    "Luxury open-air photo booth rental in Newport Beach. DSLR booth for yacht-club weddings, oceanfront estates, resort galas — Pelican Hill to the harbor.",
    [
        "Newport Beach is Orange County's coastal-luxury anchor — the Resort at Pelican Hill, the Balboa Bay Resort, the Newport Harbor yacht clubs, the Fashion Island event spaces, and a year-round calendar of yacht-club weddings, oceanfront estate receptions, and resort galas at the most polished scale on the coast.",
        "The booth's walnut-and-linen build reads as furniture against Newport's resort interiors and yacht-club venues. The DSLR sensor handles golden-hour harbor light and dramatic resort ballroom chandeliers with the same archival print quality.",
    ],
    [
        ("Yacht-Club Wedding Photo Booth Rental", "Resort at Pelican Hill weddings. Balboa Bay Resort receptions. Newport Harbor yacht-club ceremonies. Our luxury photo booth rental and wedding photo booth rental setups fit the most polished coastal scale in OC."),
        ("Resort Galas & Charity Events", "Pelican Hill ballroom galas. Newport Beach charity events. Our gala photo booth rental and charity gala photo booth rental setups fit the formal resort scale these events expect."),
        ("Brand Activations & Luxury Product Launches", "Fashion Island shop launches. Resort suite takeovers for luxury brands. Our brand activation photo booth and product launch photo booth rental setups fit the luxury scale of Newport events."),
        ("Milestone Anniversary & Luxury Private Events", "Newport oceanfront estate anniversary celebrations. Yacht-club private dining. Our milestone anniversary photo booth and luxury photo booth rental setups deliver real prints and custom templates."),
    ],
    "Why our open-air booth fits Newport Beach: the booth reads as furniture against resort interiors and yacht-club venues. The DSLR sensor handles golden-hour harbor light and dramatic resort ballroom chandeliers cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Newport Beach luxury event of any scale.",
)

add("garden-grove",
    "Garden Grove Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Garden Grove. DSLR booth for banquet-hall weddings, cultural celebrations, quinceañeras at scale.",
    [
        "Garden Grove is one of Orange County's most culturally rich communities — Little Saigon nearby, the Crystal Cathedral (Christ Cathedral), large family banquet halls, and a year-round calendar of cultural wedding banquets, quinceañeras, and family celebrations at serious scale.",
        "The booth's walnut-and-linen build reads warm against banquet hall ballroom interiors. The DSLR sensor handles dramatic chandelier lighting and the formal scale these events expect.",
    ],
    [
        ("Banquet-Hall Wedding Photo Booth Rental", "Big multi-course wedding banquets at the family banquet halls across Garden Grove. Our wedding photo booth rental scales — from 200-guest restaurants to 600-guest ballroom receptions. Custom strip templates match the formal scale."),
        ("Quinceañera Photo Booth Rental", "Garden Grove hosts a serious quinceañera calendar. Our quinceañera photo booth rental ships with custom templates in the family's color story. The walnut booth reads warm against the gowns."),
        ("Cultural Celebrations & Community Events", "Vietnamese, Korean, and Latino cultural celebrations across Garden Grove. Lunar New Year events. Our event photo booth rental setups bring custom templates with the family's color story."),
        ("Milestone Anniversary & Family Celebrations", "Garden Grove families host beautiful multi-generational anniversary celebrations. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
    ],
    "Why our open-air booth fits Garden Grove: the booth scales to formal banquet hall ballroom interiors. Real DSLR prints. A walnut frame that reads as furniture. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Garden Grove cultural wedding or family celebration of any scale.",
)

add("brea",
    "Brea Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Brea. DSLR booth for country club weddings, family celebrations, milestone events.",
    [
        "Brea is northern Orange County's family suburb — the Brea Improv, the Curtis Theatre, country club venues, the Brea Mall event spaces, and a year-round calendar of country club weddings, family celebrations, milestone anniversaries, and graduation parties.",
        "The booth's walnut-and-linen build reads as furniture in country club ballrooms and family backyards. The DSLR sensor handles dramatic chandelier lighting and outdoor afternoon receptions with the same archival print quality.",
    ],
    [
        ("Country Club Wedding Photo Booth Rental", "Brea country club weddings. Curtis Theatre receptions. Family banquet hall ceremonies. Our wedding photo booth rental fits the family-celebration scale Brea specializes in."),
        ("Milestone Anniversary & Family Celebrations", "Brea families host beautiful multi-generational anniversary celebrations. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
        ("Quinceañera & Birthday Photo Booth", "Brea quinceañeras and milestone birthdays at country clubs and family homes. Our quinceañera photo booth rental and birthday party photo booth setups bring custom templates and real prints."),
        ("Graduation Party Photo Booth Rental", "Brea family graduation parties. Our graduation party photo booth rental setups deliver custom templates and real prints."),
    ],
    "Why our open-air booth fits Brea: the booth reads as furniture in country club ballrooms and family backyards. The DSLR sensor handles dramatic chandelier lighting and outdoor afternoon receptions cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Brea family event of any scale.",
)

add("yorba-linda",
    "Yorba Linda Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Yorba Linda. DSLR booth for estate weddings, library galas, quiet family-driven celebrations.",
    [
        "Yorba Linda is northern Orange County's quiet estate community — the Richard Nixon Presidential Library, the Black Gold Golf Club, estate venues, and a year-round calendar of estate weddings, library galas, and quiet family-driven celebrations.",
        "The booth's walnut-and-linen build reads as furniture in estate interiors and the Nixon Library's event spaces. The DSLR sensor handles dramatic chandelier lighting and afternoon outdoor receptions with the same archival print quality.",
    ],
    [
        ("Estate Wedding Photo Booth Rental", "Yorba Linda estate weddings. Black Gold Golf Club ceremonies. Nixon Library event-space receptions. Our wedding photo booth rental fits the quiet, formal scale Yorba Linda specializes in."),
        ("Library Galas & Foundation Events", "The Richard Nixon Presidential Library hosts a year-round gala and foundation event calendar. Our gala photo booth rental and charity gala photo booth rental setups fit these formal rooms cleanly."),
        ("Milestone Anniversary & Family Celebrations", "Yorba Linda families host beautiful milestone anniversary celebrations. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
        ("Bridal Shower & Family Photo Booth", "Yorba Linda estate showers and family celebrations. Our bridal shower photo booth rental and private event photo booth rental setups bring custom templates and premium props."),
    ],
    "Why our open-air booth fits Yorba Linda: the booth reads as furniture in estate interiors and the Nixon Library's event spaces. The DSLR sensor handles dramatic chandelier lighting and afternoon outdoor receptions cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Yorba Linda estate or family event of any scale.",
)

add("tustin",
    "Tustin Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Tustin. DSLR booth for historic-hangar weddings, modern venues, family celebrations.",
    [
        "Tustin is central Orange County's mix of historic and modern — the iconic Tustin blimp hangars, the historic Old Town Tustin, the District event spaces, and a year-round calendar of dramatic hangar weddings, modern venue receptions, and family celebrations.",
        "The booth's walnut-and-linen build reads dramatically warm against the Tustin hangars' massive scale and the modern venue interiors. The DSLR sensor handles dramatic high-ceiling lighting and modern interiors with the same archival print quality.",
    ],
    [
        ("Historic-Hangar Wedding Photo Booth Rental", "The Tustin blimp hangars are some of the most dramatic event spaces in California. Our wedding photo booth rental works because the walnut booth provides intimate warmth against the hangars' massive industrial scale."),
        ("Modern Venue & Family Wedding Photo Booth", "Old Town Tustin venue weddings. The District event-space receptions. Family backyard ceremonies. Our wedding photo booth rental fits Tustin's mix of historic and modern."),
        ("Quinceañera & Family Celebrations", "Tustin quinceañeras and family celebrations at banquet halls and family backyards. Our quinceañera photo booth rental ships with custom templates in the family's color story."),
        ("Corporate Events & Brand Activations", "The Tustin hangars and modern venues host year-round corporate events and brand activations at dramatic scale. Our corporate event photo booth rental and brand activation photo booth setups fit these spaces cleanly."),
    ],
    "Why our open-air booth fits Tustin: the walnut booth provides intimate warmth against the hangars' massive industrial scale and reads as furniture in modern venues. The DSLR sensor handles dramatic high-ceiling lighting and modern interiors cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Tustin event of any scale.",
)

# ============ VENTURA COUNTY EDGE (4) ============

add("thousand-oaks",
    "Thousand Oaks Photo Booth Rental — DSLR Open-Air | Evergrain",
    "Open-air photo booth rental in Thousand Oaks. DSLR booth for oak-shaded estate weddings, library galas, corporate events, family celebrations.",
    [
        "Thousand Oaks anchors the Conejo Valley — the Reagan Presidential Library nearby, the Thousand Oaks Civic Arts Plaza, the Sherwood and Los Robles golf clubs, oak-shaded estates, and a year-round calendar of estate weddings, corporate retreats, foundation galas, and multigenerational family celebrations.",
        "The booth's walnut-and-linen build reads as furniture in Thousand Oaks' estate interiors and country club ballrooms. The DSLR sensor handles oak-shaded afternoon light and dramatic ballroom chandeliers with the same archival print quality.",
    ],
    [
        ("Oak-Shaded Estate Wedding Photo Booth Rental", "Thousand Oaks estate weddings under heritage oaks. Los Robles Greens ceremonies. Civic Arts Plaza receptions. Our wedding photo booth rental fits the Conejo Valley formal scale with that quiet polish Thousand Oaks specializes in."),
        ("Corporate Retreats & Brand Events", "Amgen, the Conejo corporate corridor, and the Four Seasons Westlake Village nearby run a strong corporate calendar. Our corporate event photo booth rental and brand activation photo booth setups fit these formal rooms cleanly."),
        ("Library & Foundation Galas", "The Reagan Presidential Library hosts year-round foundation galas under the Air Force One pavilion. Our gala photo booth rental and charity gala photo booth rental setups fit the formal scale these events expect."),
        ("Bar Mitzvah, Bat Mitzvah & Family Celebrations", "Thousand Oaks has a strong Jewish community — Temple Etz Chaim, Temple Adat Elohim. Our event photo booth rental and milestone anniversary photo booth setups bring custom templates with the family's color story."),
    ],
    "Why our open-air booth fits Thousand Oaks: the booth reads as furniture in estate interiors and country club ballrooms. The DSLR sensor handles oak-shaded afternoon light and dramatic ballroom chandeliers cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Thousand Oaks estate, corporate, or family event of any scale.",
)

add("agoura-hills",
    "Agoura Hills Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Agoura Hills. DSLR booth for vineyard estate weddings, country club events, intimate hillside ceremonies.",
    [
        "Agoura Hills is the Conejo Valley's wine-and-hills corner — Saddle Peak Lodge nearby, the vineyard estates, the country club venues, and a year-round calendar of intimate hillside weddings, vineyard estate receptions, and family celebrations.",
        "The booth's walnut-and-linen build reads beautifully against vineyard estate venues and hillside ceremony settings. The DSLR sensor handles afternoon hillside light and string-lit evening receptions cleanly.",
    ],
    [
        ("Vineyard Estate Wedding Photo Booth Rental", "Agoura Hills vineyard-style estate weddings. Hillside ceremony venues. Country club receptions. Our wedding photo booth rental fits the intimate vineyard-estate scale Agoura Hills specializes in."),
        ("Country Club Galas & Corporate Events", "Agoura Hills country club galas and corporate retreats. Our gala photo booth rental and corporate event photo booth rental setups fit the formal scale these events expect."),
        ("Milestone Anniversary & Family Celebrations", "Agoura Hills families host beautiful milestone anniversary celebrations. Our milestone anniversary photo booth setups deliver custom templates and real prints."),
        ("Bridal Shower & Intimate Event Photo Booth", "Vineyard estate showers. Hillside private dinners. Our bridal shower photo booth rental and luxury photo booth rental setups fit the intimate scale these events run on."),
    ],
    "Why our open-air booth fits Agoura Hills: the booth reads beautifully against vineyard estate venues and hillside ceremony settings. The DSLR sensor handles afternoon hillside light and string-lit evening receptions cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for an Agoura Hills vineyard or family event of any scale.",
)

add("westlake-village",
    "Westlake Village Photo Booth Rental — Luxury Open-Air | Evergrain",
    "Luxury open-air photo booth rental in Westlake Village. DSLR booth for lakefront weddings, resort ballroom galas, elegant family celebrations.",
    [
        "Westlake Village is the Conejo Valley's lakefront luxury corner — the Four Seasons Westlake Village, the Westlake Village Inn, the lakefront estates, the Sherwood Country Club nearby, and a year-round calendar of lakefront weddings, resort ballroom galas, and elegant multigenerational family celebrations.",
        "The booth's walnut-and-linen build reads as furniture in resort ballrooms and lakefront estate interiors. The DSLR sensor handles golden-hour lakefront light and dramatic resort chandeliers with the same archival print quality.",
    ],
    [
        ("Lakefront Wedding Photo Booth Rental", "Westlake Village Inn lakefront weddings. Four Seasons ballroom receptions. Lakefront estate ceremonies. Our luxury photo booth rental and wedding photo booth rental setups fit the elegant lakefront scale Westlake Village specializes in."),
        ("Resort Galas & Corporate Events", "Four Seasons Westlake Village galas. Hyatt Regency Westlake corporate retreats. Our gala photo booth rental and corporate event photo booth rental setups fit these formal resort rooms cleanly."),
        ("Milestone Anniversary & Family Celebrations", "Westlake Village families host beautiful milestone anniversary celebrations. Our milestone anniversary photo booth setups deliver real prints that grandparents will frame."),
        ("Bridal Shower & Luxury Private Events", "Lakefront estate showers. Resort private dining. Our bridal shower photo booth rental and luxury photo booth rental setups fit the elegant scale these events run on."),
    ],
    "Why our open-air booth fits Westlake Village: the booth reads as furniture in resort ballrooms and lakefront estate interiors. The DSLR sensor handles golden-hour lakefront light and dramatic resort chandeliers cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Westlake Village luxury event of any scale.",
)

add("simi-valley",
    "Simi Valley Photo Booth Rental — DSLR Open-Air Booth | Evergrain",
    "Open-air photo booth rental in Simi Valley. DSLR booth for ranch weddings, Reagan Library galas, hilltop estate celebrations.",
    [
        "Simi Valley anchors the eastern Ventura edge — the Ronald Reagan Presidential Library with its Air Force One pavilion, Hummingbird Nest Ranch, hilltop estates, and a year-round calendar of dramatic ranch weddings, library galas, and family-rooted celebrations.",
        "The booth's walnut-and-linen build reads as furniture against ranch venues and the Reagan Library's dramatic event spaces. The DSLR sensor handles afternoon ranch light and dramatic high-ceiling library lighting with the same archival print quality.",
    ],
    [
        ("Ranch Wedding Photo Booth Rental", "Hummingbird Nest Ranch weddings. Hilltop estate ceremonies. Our wedding photo booth rental fits the dramatic ranch scale Simi Valley specializes in — outdoor afternoon ceremonies, tented evening receptions, and a booth that reads warm against the ranch architecture."),
        ("Reagan Library Galas & Foundation Events", "The Reagan Presidential Library hosts a year-round gala calendar under the Air Force One pavilion — one of the most photographed venues in California. Our gala photo booth rental and charity gala photo booth rental setups fit the dramatic formal scale these events expect."),
        ("Retirement Celebrations & Milestone Events", "Simi Valley retirement celebrations and milestone anniversaries at the library banquet rooms and ranch venues. Our retirement party photo booth rental and milestone anniversary photo booth setups deliver custom templates and real prints."),
        ("Quinceañera & Family Celebrations", "Simi Valley quinceañeras and family celebrations at banquet halls and family backyards. Our quinceañera photo booth rental ships with custom templates in the family's color story."),
    ],
    "Why our open-air booth fits Simi Valley: the booth reads as furniture against ranch venues and the Reagan Library's dramatic event spaces. The DSLR sensor handles afternoon ranch light and dramatic high-ceiling library lighting cleanly. Photo booth rental cost includes setup, attendant, prints, and the gallery — straightforward pricing for a Simi Valley ranch, library, or family event of any scale.",
)

if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    src = root / "data" / "areas.json"
    data = json.loads(src.read_text(encoding="utf-8"))
    touched = 0
    for region in data["regions"]:
        for nbhd in region["neighborhoods"]:
            if nbhd["slug"] in ENRICHMENT:
                nbhd.update(ENRICHMENT[nbhd["slug"]])
                touched += 1
    src.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Enriched {touched} of {sum(len(r['neighborhoods']) for r in data['regions'])} neighborhoods.")
