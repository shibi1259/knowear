const helper = require("../../../util/responseHelper");
const { messages } = require("../../../config/constants");
const service = require("../../services/shippingnote.service");
const cartService = require("../../services/cart.service");
const activity = require("../../../util/activity.creator");
exports.manageDeliveryNote = async (req, res) => {
    try {
        const { body } = req;
        const slug = body.note.toLowerCase().replace(/ /g, '-');

        // Step 1: Fetch cart by ID
        const cartDetails = await cartService.getCart({ _id: body.cartId });

        // Step 2: Check if cart already has a shipping note
        if (cartDetails?.shippingnote) {
            const existingShippingNote = await service.findOne({ _id: cartDetails.shippingnote });

            if (existingShippingNote) {
                const updatedNote = await service.update(
                    { _id: existingShippingNote._id },
                    { isEnabled: true }
                );

                if (updatedNote instanceof Error) {
                    return helper.deliverResponse(res, 422, {}, {
                        "error_code": messages.serverError.error_code,
                        "error_message": messages.serverError.error_message
                    });
                }

                activity.logActivity(res?.locals?.user?.email, `Existing shipping note enabled`);
                return helper.deliverResponse(res, 200, updatedNote, {
                    "error_code": messages.successResponse.error_code,
                    "error_message": messages.successResponse.error_message
                });
            }
        }

        // Step 3: No existing shipping note linked to cart — use or create one by slug
        const existingDetails = await service.findOne({ cartId: body?.cartId });       

        if (existingDetails) {
            // Update the note with new cartId and content
            const updatedNote = await service.update(
                { _id: existingDetails._id },
                { cartId: body.cartId, note: body.note, isEnabled: true }
            );

            if (updatedNote instanceof Error) {
                return helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            }

            await cartService.updateCart({ _id: body.cartId }, { shippingnote: updatedNote._id });

            activity.logActivity(res?.locals?.user?.email, `Existing delivery note updated and linked to cart`);
            return helper.deliverResponse(res, 200, updatedNote, {
                "error_code": messages.successResponse.error_code,
                "error_message": messages.successResponse.error_message
            });
        }

        // Step 4: Create new shipping note
        const newNote = await service.create({
            note: body.note,
            slug,
            isEnabled: true,
            cartId: body.cartId
        });

        if (newNote instanceof Error) {
            return helper.deliverResponse(res, 422, {}, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        }

        await cartService.updateCart({ _id: body.cartId }, { shippingnote: newNote._id });

        activity.logActivity(res?.locals?.user?.email, `New delivery note created and linked to cart`);
        return helper.deliverResponse(res, 200, newNote, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });

    } catch (error) {
        console.log('Error caught in manage delivery note API :: ', error);
        return helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
};

exports.deliveryNoteDetails = async (req, res) => {
    try {
        console.log(req.body,"the request")
        const { cartId } = req.body; // Corrected to req.body as per the context
        console.log(cartId,"cartid")
        if (!cart) {
            throw new Error('Cart not found');
        }
        const cart = await cartService.getCartByCartId(cartId);
        console.log(cart,"cart")
        
            
        const shippingNoteId = cart.shippingnote;
        const details = await service.findOne(
            { _id: shippingNoteId }, 
            { _id: 0, __v: 0 }
        );
           
        if (!details) {
            throw new Error('Delivery note not found');
        }
        
        helper.deliverResponse(res, 200, details, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in delivery note details API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
};