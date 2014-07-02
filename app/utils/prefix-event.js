export default function prefixEvent (event) {
    var vendorPrefixes = ['webkit', 'moz', 'MS', 'o', ''];
    var prefixedEventNames = vendorPrefixes.map(function (prefix) {
        return (prefix ? prefix + event : event.toLowerCase());
    });
    return prefixedEventNames.join(' ');
}
