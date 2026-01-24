export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        // Here you would typically send an email
        console.log('Contact form submission:', Object.fromEntries(data));

        return { success: true };
    }
};
