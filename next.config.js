/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    images: {
        domains: ["amazonaws.com", "assets.thefoodo.com","s3.eu-west-3.amazonaws.com"],
       
    },
};

export default config;
