import csv
import json

class Node(object):
    def __init__(self, name, size=None, extra=None):
        self.name = name
        self.children = []
        self.size = size
        self.extra = extra

    def child(self, cname, size=None, extra=None):
        child_found = [c for c in self.children if c.name == cname]
        if not child_found:
            _child = Node(cname, size, extra)
            self.children.append(_child)
        else:
            _child = child_found[0]
        return _child

    def as_dict(self):
        res = {'name': self.name}
        if self.size is None:
            res['children'] = [c.as_dict() for c in self.children]
        else:
            res['size'] = self.size

        if self.extra:
            res.update(self.extra)

        return res


root = Node('BG')

with open('C:/Users/sdzar/Documents/GitHub/CGT370DataVics/Project/data.csv', 'r') as f:
    reader = csv.reader(f)
    next(reader)
    for row in reader:
        ID,Region,SubRegion,Country,a2017,a2016,a2015,a2014,a2013,a2012,a2011,a2010,a2009,a2008,a2007,a2006,a2005,a2004,a2003,a2002,a2001,a2000,a1999,a1998,a1997,a1996,a1995,a1994,a1993,a1992,a1991,a1990,a1989,a1988,a1987,a1986,a1985,a1984,a1983,a1982,a1981,a1980,size = row
        root.child(Region).child(SubRegion).child(Country, size = size, extra = {"data" : {"ID": ID, "Country": Country, "2017": a2017, "2016": a2016, "2015": a2015, "2014": a2014, "2013": a2013, "2012": a2012, "2011": a2011, "2010": a2010, "2009": a2009, "2008": a2008, "2007": a2007, "2006": a2006, "2005": a2005, "2004": a2004, "2003": a2003, "2002": a2002, "2001": a2001, "2000": a2000, "1999": a1999, "1998": a1998, "1997": a1997, "1996": a1996, "1995": a1995, "1994": a1994, "1993": a1993, "1992": a1992, "1991": a1991, "1990": a1990, "1989": a1989, "1989": a1989, "1988": a1988, "1987": a1987, "1986": a1986, "1985": a1985, "1984": a1984, "1983": a1983, "1982": a1982, "1981": a1981, "1980": a1980}})

with open('C:/Users/sdzar/Documents/GitHub/CGT370DataVics/Project/ab.json', 'w') as out:
    json.dump(root.as_dict(), out)
