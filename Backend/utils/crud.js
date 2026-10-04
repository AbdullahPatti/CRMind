import { asyncHandler } from "./asyncHandler.js";
import { ApiError } from "./ApiError.js";

const PROTECTED = ["_id", "owner", "createdAt", "updatedAt", "__v"];

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Owner-scoped CRUD handlers for a model.
 *   key       — response key, e.g. "lead" → { lead } / { leads }
 *   refs      — { field: Model } references that must belong to the same owner
 *   populate  — populate spec applied to every returned doc
 *   filters   — query params copied straight into the filter
 *   search    — fields matched by ?search=
 *   sort      — list sort order
 */
export const crud = (Model, { key, refs = {}, populate = [], filters = [], search = [], sort = { createdAt: -1 } }) => {
    const label = key[0].toUpperCase() + key.slice(1);

    const clean = async (body, owner) => {
        const data = { ...body };
        PROTECTED.forEach((f) => delete data[f]);
        for (const [field, RefModel] of Object.entries(refs)) {
            if (!(field in data)) continue;
            if (!data[field]) { data[field] = null; continue; }
            const exists = await RefModel.exists({ _id: data[field], owner });
            if (!exists) throw new ApiError(400, `Invalid ${field}`);
        }
        return data;
    };

    const findOwned = async (req) => {
        const doc = await Model.findOne({ _id: req.params.id, owner: req.user._id });
        if (!doc) throw new ApiError(404, `${label} not found`);
        return doc;
    };

    return {
        list: asyncHandler(async (req, res) => {
            const filter = { owner: req.user._id };
            filters.forEach((f) => { if (req.query[f]) filter[f] = String(req.query[f]); });
            if (req.query.search && search.length) {
                const rx = new RegExp(escapeRegex(req.query.search), "i");
                filter.$or = search.map((f) => ({ [f]: rx }));
            }
            const docs = await Model.find(filter).sort(sort).populate(populate);
            res.json({ success: true, count: docs.length, [`${key}s`]: docs });
        }),

        get: asyncHandler(async (req, res) => {
            const doc = await findOwned(req);
            res.json({ success: true, [key]: await doc.populate(populate) });
        }),

        create: asyncHandler(async (req, res) => {
            const data = await clean(req.body, req.user._id);
            const doc = await Model.create({ ...data, owner: req.user._id });
            res.status(201).json({ success: true, [key]: await doc.populate(populate) });
        }),

        update: asyncHandler(async (req, res) => {
            const doc = await findOwned(req);
            doc.set(await clean(req.body, req.user._id));
            await doc.save();
            res.json({ success: true, [key]: await doc.populate(populate) });
        }),

        remove: asyncHandler(async (req, res) => {
            const doc = await findOwned(req);
            await doc.deleteOne();
            res.json({ success: true, message: `${label} deleted` });
        }),
    };
};
