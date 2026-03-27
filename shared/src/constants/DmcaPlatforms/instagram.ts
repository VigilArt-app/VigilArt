import { DmcaPlatformCreate } from "../../types";

export const InstagramDmcaFormJSON = {
    slug: "INSTAGRAM",
    displayName: "Instagram",
    dmcaUrl: "https://www.instagram.com/help/ipreporting/report/copyright/",
    email: "ip@instagram.com",
    domain: "https://www.instagram.com/",
    websiteCategory: "SOCIAL",
    formSchema: [
        {
            kind: "group",
            key: "contact_information",
            title: "Your contact information",
            items: [
                {
                    kind: "field",
                    key: "full_name",
                    type: "text",
                    title: "Full Name",
                    placeholder: "Your full name",
                    required: true
                },
                {
                    kind: "field",
                    key: "email",
                    type: "email",
                    title: "Email Address",
                    placeholder: "your@email.com",
                    required: true
                },
                {
                    kind: "field",
                    key: "rights_holder",
                    type: "text",
                    title: "Name of the rights holder",
                    placeholder: "Name of the rights holder",
                    required: true
                },
                {
                    kind: "field",
                    key: "country",
                    type: "text",
                    title: "Where are you asserting your rights ?",
                    placeholder: "Where are you asserting your rights ?",
                    required: true
                },
                {
                    kind: "field",
                    key: "report_kind",
                    type: "text",
                    title: "Which of these best describes the copyrighted work?",
                    description: "Possible inputs are: Photo, Video, Text and Other",
                    required: true
                },
                {
                    kind: "field",
                    key: "original_work_url",
                    type: "url",
                    title: "Provide a link to the copyrighted work.",
                    description: "You can provide one link (URL) to examples on your website, your Facebook Page or anywhere else on the web. Each individual report submitted must pertain to only one type of copyrighted work, which should be clearly identified here. Please note that we are unable to review materials hosted on a third-party application.",
                    placeholder: "Provide a link to the copyrighted work.",
                    required: true
                },
                {
                    kind: "field",
                    key: "original_work_description",
                    type: "textarea",
                    title: "Describe your copyrighted work in the link you provided above.",
                    placeholder: "Describe your copyrighted work in the link you provided above.",
                    required: true
                }
            ]
        },
        {
            kind: "group",
            key: "infringing_content",
            title: "Content you want to report",
            items: [
                {
                    kind: "field",
                    key: "report_kind",
                    type: "text",
                    title: "What type of content are you reporting?",
                    description: "Possible inputs are: Photo/Video/Post, Story, Ad and Other",
                    placeholder: "What type of content are you reporting?",
                    required: true
                },
                {
                    kind: "array",
                    key: "infringements",
                    title: "Please provide links (URLs) leading directly to the specific content you are reporting.",
                    description: "You can report multiple links (URLs) in this report. To do this, enter links (URLs) in the box below. Enter one link per line.",
                    minItems: 1,
                    maxItems: 50,
                    itemSchema: [
                        {
                            kind: "field",
                            key: "infringing_url",
                            type: "url",
                            title: "Link",
                            placeholder: "https://www.instagram.com/...",
                            required: true
                        }
                    ]
                },
                {
                    kind: "field",
                    key: "content_infrigement_description",
                    type: "textarea",
                    title: "Describe how you believe this content infringes your intellectual property rights, and provide any additional information that can help us understand your report.",
                    placeholder: "Describe how you believe this content infringes your intellectual property rights, and provide any additional information that can help us understand your report.",
                    required: true
                }
            ]
        },
        {
            kind: "group",
            key: "legal_declarations",
            title: "Declaration Statement",
            description: "By submitting this notice, you state that you have a good faith belief that the reported use described above, in the manner you have complained of, is not authorized by the intellectual property rights owner, its agent, or the law; that the information contained in this notice is accurate; and, under penalty of perjury, that you are authorized to act on behalf of the owner of the intellectual property rights at issue.",
            items: [
                {
                    kind: "field",
                    key: "signature",
                    type: "text",
                    title: "Electronic signature",
                    description: "Your electronic signature should match your full name.",
                    placeholder: "Electronic signature",
                    required: true
                }
            ]
        }
    ]
} as const satisfies DmcaPlatformCreate;
