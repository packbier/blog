import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { buildIndex, createBlogEntry, createYearlyStructure, listBlogEntries } from "./scripts/create_structure";

yargs(hideBin(process.argv))
    .command(
        "create-year <year>",
        "Create directory structure for a given year",
        (yargs) => yargs.positional("year", {
            description: "The year for which to create the directory structure",
            type: "number",
            demandOption: true,
        }),
        (argv) => {
            createYearlyStructure(argv.year);
        }
    )
    .command(
        "create-entry <title>",
        "Create a new blog entry for a specific date",
        (yargs) => yargs
            .option("year", {
                description: "The year",
                type: "number",
                default: new Date().getFullYear(),
            })
            .option("month", {
                description: "The month (1-12)",
                type: "number",
                default: new Date().getMonth() + 1,
            })
            .option("day", {
                description: "The day (1-31)",
                type: "number",
                default: new Date().getDate(),
                demandOption: false,
            })
            .positional("title", {
                description: "The title of the blog entry",
                type: "string",
                demandOption: true,
            }),
        (argv) => {
            createBlogEntry(argv.year, argv.month, argv.day, argv.title);
            buildIndex();
        }
    )
    .command(
        "list [year] [month]",
        "List all blog entries, optionally filtered by year and/or month",
        (yargs) => yargs
            .positional("year", {
                description: "Filter by year",
                type: "number",
            })
            .positional("month", {
                description: "Filter by month (1-12)",
                type: "number",
            }),
        (argv) => {
            listBlogEntries(argv.year, argv.month);
        }
    )
    .command(
        "build",
        "Generate blog-index.json for client-side consumption",
        () => { },
        () => {
            buildIndex();
        }
    )
    .demandCommand(1, "You need to specify a command")
    .help()
    .parse();