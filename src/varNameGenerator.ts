/**
 * Generates alphabetical lowercase variable names in the order a,b,c...z,aa,ab,ac..zz,aaa.
 * Essentially a counter in unary base-26.
 */
export default function varNameGenerator() {
    let varCount = 0;

    const getNextVarName = () => {
        let str = '';
        let d = ++varCount;
        let m;

        while (d > 0) {
            m = (d - 1) % 26;
            str = String.fromCharCode(97 + m) + str;
            d = Math.floor((d - m) / 26);
        }

        return str;
    };

    return getNextVarName;
}
