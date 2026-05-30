document.addEventListener('alpine:init', () => {
    Alpine.data('nisneApp', () => ({
        openModal: false,
        activeProduct: {},
        enquiryMessage: '',
        activeFilter: 'all',
        mobileMenuOpen: false,

        form: {
            name: '',
            email: '',
            business: '',
        },
        touched: {
            name: false,
            email: false,
            business: false,
            message: false,
        },
        submitting: false,
        submitSuccess: false,
        submitError: '',

        get messageLength() {
            return this.enquiryMessage.trim().length;
        },

        get isFormValid() {
            return (
                this.form.name.trim().length > 0 &&
                this.isValidEmail(this.form.email) &&
                this.form.business.trim().length > 0 &&
                this.messageLength >= 50
            );
        },

        isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
        },

        touch(field) {
            this.touched[field] = true;
        },

        fieldError(field) {
            if (!this.touched[field]) return '';

            switch (field) {
                case 'name':
                    return this.form.name.trim() ? '' : 'Name is required.';
                case 'email':
                    if (!this.form.email.trim()) return 'Email is required.';
                    return this.isValidEmail(this.form.email) ? '' : 'Enter a valid email address.';
                case 'business':
                    return this.form.business.trim() ? '' : 'Business is required.';
                case 'message':
                    if (!this.enquiryMessage.trim()) return 'Message is required.';
                    return this.messageLength >= 50 ? '' : `Message must be at least 50 characters (${this.messageLength}/50).`;
                default:
                    return '';
            }
        },

        async submitEnquiry(e) {
            e.preventDefault();

            this.touched = { name: true, email: true, business: true, message: true };
            if (!this.isFormValid || this.submitting) return;

            const accessKey = window.WEB3FORMS_ACCESS_KEY;
            if (!accessKey) {
                this.submitError = 'Form is not configured. Please try again later.';
                return;
            }

            this.submitting = true;
            this.submitError = '';

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({
                        access_key: accessKey,
                        name: this.form.name.trim(),
                        email: this.form.email.trim(),
                        message: this.enquiryMessage.trim(),
                        subject: `Nisne Enquiry from ${this.form.name.trim()}`,
                        from_name: 'Nisne Website',
                        business: this.form.business.trim(),
                    }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    this.submitSuccess = true;
                    this.form = { name: '', email: '', business: '' };
                    this.enquiryMessage = '';
                    this.touched = { name: false, email: false, business: false, message: false };
                } else {
                    this.submitError = data.message || 'Something went wrong. Please try again.';
                }
            } catch {
                this.submitError = 'Unable to send your enquiry. Please check your connection and try again.';
            } finally {
                this.submitting = false;
            }
        },

        resetForm() {
            this.submitSuccess = false;
            this.submitError = '';
        },
    }));
});
