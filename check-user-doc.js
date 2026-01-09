// RUN THIS IN BROWSER CONSOLE (F12) TO CHECK YOUR USER DOCUMENT

// 1. Check if you're logged in
console.log('Current User:', firebase.auth().currentUser);
console.log('User UID:', firebase.auth().currentUser?.uid);
console.log('User Email:', firebase.auth().currentUser?.email);

// 2. Try to read your user document
const checkUserDoc = async () => {
    const uid = firebase.auth().currentUser?.uid;
    if (!uid) {
        console.error('❌ Not logged in!');
        return;
    }
    
    try {
        const doc = await firebase.firestore().collection('users').doc(uid).get();
        
        if (doc.exists) {
            console.log('✅ User document EXISTS:');
            console.log(doc.data());
        } else {
            console.error('❌ User document DOES NOT EXIST!');
            console.log('Creating user document now...');
            
            // Create the user document
            await firebase.firestore().collection('users').doc(uid).set({
                email: firebase.auth().currentUser.email,
                name: firebase.auth().currentUser.displayName || firebase.auth().currentUser.email,
                role: 'admin',
                disabled: false,
                createdAt: new Date().toISOString()
            });
            
            console.log('✅ User document created! Refresh the page.');
        }
    } catch (error) {
        console.error('❌ Error reading user document:', error.message);
        console.error('Full error:', error);
    }
};

checkUserDoc();
