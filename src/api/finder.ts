export function finder(
    action: Function,
    queryKeys: string[],
    bodyKeys: string[] | '...'
): any {
    return function (req: any, res: any) {
        let data: any[] = [];

        queryKeys.forEach(key => {
            if (req.query[key]) data.push(req.query[key]);
        });

        if (req.body) {
            if (bodyKeys == '...') {
                data.push(req.body);
            } else {
                bodyKeys.forEach(key => {
                    if (req.body[key]) data.push(req.body[key]);
                });
            }
        }

        let result = action(...data);

        if (result instanceof Promise)
            return result
                .then(d => res.send(d))
                .catch((err: any) => {
                    console.error(err);
                    res.send(err);
                });

        res.send(result);
    }
}