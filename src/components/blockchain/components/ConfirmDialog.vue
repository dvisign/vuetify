<template>
    <v-dialog v-model="showDialog" persistent max-width="320">
        <v-card>
        <v-card-title class="text-h12">{{ message }}</v-card-title>
        <v-card-actions>
            <v-btn color="green darken-1" text @click="_cancel">아니요</v-btn>
            <v-btn color="red dark-1" text @click="_confirm">네</v-btn>
        </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default{


    name: 'ConfirmDialog',
    data() {
        return {
            showDialog: false,
            message: undefined,
            resolvePromise: undefined,
            rejectPromise: undefined,
        }
    },
    methods: {
        show (data) {
            this.message = data.message || 'missing "message".'
            this.showDialog = true
            
            return new Promise((resolve, reject) => {
                this.resolvePromise = resolve
                this.rejectPromise = reject
            })
        },

        _confirm() {
            this.showDialog = false
            this.resolvePromise(true)
        },

        _cancel() {
            this.showDialog = false
            this.resolvePromise(false)
            // Or you can throw an error
            // this.rejectPromise(new Error('User cancelled the dialogue'))
        },
    }
}
</script>