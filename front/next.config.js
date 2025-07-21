const isLocal = process.env.NEXT_PUBLIC_IS_LOCAL === "true";
const isMain = process.env.NEXT_PUBLIC_IS_MAIN_PRODUCT === "true";

module.exports = {
    output: 'standalone',
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false,
            };
        }
        return config;
    },
    async redirects() {
        return [
            {
                source: '/index',
                destination: '/',
                permanent: true,
            },
        ];
    },
    env: {
        NEXT_PUBLIC_API_URL_GET_USER:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_GET_USER_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_GET_USER_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_GET_USER_TEST,

        NEXT_PUBLIC_API_URL_LOGIN:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_LOGIN_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_LOGIN_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_LOGIN_TEST,

        NEXT_PUBLIC_API_URL_UPDATE_USER:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_UPDATE_USER_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_UPDATE_USER_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_UPDATE_USER_TEST,

        NEXT_PUBLIC_API_URL_UPLOAD_PROFILE_IMG:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_UPLOAD_PROFILE_IMG_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_UPLOAD_PROFILE_IMG_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_UPLOAD_PROFILE_IMG_TEST,

        NEXT_PUBLIC_API_URL_RECEIVE_INQUIRIES:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_RECEIVE_INQUIRIES_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_RECEIVE_INQUIRIES_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_RECEIVE_INQUIRIES_TEST,

        NEXT_PUBLIC_API_URL_GET_EVENT_DETAIL:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_GET_EVENT_DETAIL_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_GET_EVENT_DETAIL_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_GET_EVENT_DETAIL_TEST,

        NEXT_PUBLIC_API_URL_PARTICIPATE:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_PARTICIPATE_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_PARTICIPATE_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_PARTICIPATE_TEST,

        NEXT_PUBLIC_API_URL_GET_CATEGORIES:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_GET_CATEGORIES_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_GET_CATEGORIES_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_GET_CATEGORIES_TEST,

        NEXT_PUBLIC_API_URL_GET_KEYWORDS:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_GET_KEYWORDS_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_GET_KEYWORDS_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_GET_KEYWORDS_TEST,

        NEXT_PUBLIC_API_URL_GET_SELF_CREATED_EVENTS:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_GET_SELF_CREATED_EVENTS_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_GET_SELF_CREATED_EVENTS_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_GET_SELF_CREATED_EVENTS_TEST,

        NEXT_PUBLIC_API_URL_GET_DRAFT:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_GET_DRAFT_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_GET_DRAFT_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_GET_DRAFT_TEST,

        NEXT_PUBLIC_API_URL_CREATE_EVENT:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_CREATE_EVENT_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_CREATE_EVENT_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_CREATE_EVENT_TEST,

        NEXT_PUBLIC_API_URL_UPDATE_EVENT:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_UPDATE_EVENT_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_UPDATE_EVENT_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_UPDATE_EVENT_TEST,

        NEXT_PUBLIC_API_URL_DELETE_EVENT:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_DELETE_EVENT_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_DELETE_EVENT_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_DELETE_EVENT_TEST,

        NEXT_PUBLIC_API_URL_SEARCH_EVENTS:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_SEARCH_EVENTS_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_SEARCH_EVENTS_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_SEARCH_EVENTS_TEST,

        NEXT_PUBLIC_API_URL_GET_PARTICIPANTS:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_GET_PARTICIPANTS_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_GET_PARTICIPANTS_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_GET_PARTICIPANTS_TEST,

        NEXT_PUBLIC_API_URL_ADD_FAVORITE:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_ADD_FAVORITE_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_ADD_FAVORITE_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_ADD_FAVORITE_TEST,

        NEXT_PUBLIC_API_URL_GET_FAVORITES:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_GET_FAVORITES_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_GET_FAVORITES_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_GET_FAVORITES_TEST,

        NEXT_PUBLIC_API_URL_REMOVE_FAVORITE:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_REMOVE_FAVORITE_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_REMOVE_FAVORITE_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_REMOVE_FAVORITE_TEST,

        NEXT_PUBLIC_API_URL_CREATE_INQUIRY:
        isLocal
            ? process.env.NEXT_PUBLIC_API_URL_CREATE_INQUIRY_LOCAL
            : isMain
            ? process.env.NEXT_PUBLIC_API_URL_CREATE_INQUIRY_PRODUCT
            : process.env.NEXT_PUBLIC_API_URL_CREATE_INQUIRY_TEST,
    },
};