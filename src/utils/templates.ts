import { moment } from "obsidian";

export function processObTemplate(Content: string) {
    return processObTemplateInContext(Content, { moment: moment() });
}

type Context = {
    moment: moment.Moment;
};

export function processObTemplateInContext(
    Content: string,
    context: Context
) {
    // match {{date:format}}, {{time:format}}
    const dateFormatRegex = /{{date:(.*?)}}/g;
    const timeFormatRegex = /{{time:(.*?)}}/g;
    const dateRegex = /{{date}}/g;
    const timeRegex = /{{time}}/g;
    const momentTime = context.moment;

    let res = Content.replace(dateFormatRegex, (match, format) => {
        return momentTime.format(format?.trim() || "YYYY-MM-DD");
    });
    res = res.replace(timeFormatRegex, (match, format) => {
        return momentTime.format(format?.trim() || "HH:mm");
    });
    res = res.replace(dateRegex, () => {
        return momentTime.format("YYYY-MM-DD");
    });
    res = res.replace(timeRegex, () => {
        return momentTime.format("HH:mm");
    });

    return res;
}
