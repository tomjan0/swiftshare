// const copyToClipboard = filename => {
//     const url = urls[filename];
//     const textField = document.createElement('textarea')
//     textField.innerText = url;
//     document.body.appendChild(textField);
//     textField.select();
//     textField.setSelectionRange(0, 99999)
//     document.execCommand('copy');
//     textField.remove();
//     setShowToast(true);
//     setToastTimeout(prev => {
//         if (prev) {
//             clearTimeout(prev);
//         }
//         return setTimeout(() => {
//             setShowToast(false);
//         }, 1000)
//     })
// }
