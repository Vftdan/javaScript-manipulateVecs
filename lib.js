var VecLib = (function ()
{
	var VecMx, VecSet, pRand, vecEq, vecSubSet;
	//<rand>
	pRand = function (seed)
		{
			var v1 = seed,
				v2 = seed | 12,
				v3, v4, iter = 0;
			var reCalc, Next, compute, Skip;
			reCalc = function ()
			{
				v3 = v1 & 7;
				v4 = v1 >> 3;
				v2 = (v1 << v3) ^ (v2 >> 1);
				v1 = v1 ^ v2;
			}
			compute = function ()
			{
				return (v1 & (v2 << v3)) | (v2 & ((v1 ^ v4) >> (iter & v3)));
			}
			Next = function (m1, m2)
			{
				var L = arguments.length;
				if (L == 1)
				{
					return Math.abs(Next()) % m1
				}
				if (L > 1)
				{
					return (Math.abs(Next()) % (m2 - m1)) + m1
				}
				iter++;
				reCalc();
				return compute();
			}
			Skip = function (n)
			{
				n = n || 1;
				var i;
				iter += n;
				for (i = 0; i ^ n; i++)
				{
					reCalc();
				}
			}
			return {
				Next: Next,
				Skip: Skip,
				constructor: pRand
			};
		}
		//</rand>
		//<vecEq>
	vecSubSet = function (v1, v2)
	{
		if ((v1 != v1) && (v2 != v2)) return true;
		var t = typeof v1;
		if (typeof v2 != t) return false;
		if (["null", "undefined"].indexOf(t) + 1) return true;
		if (v1 == v2) return true;
		if (["string", "number", "boolean"].indexOf(t) + 1) return false;
		if (t == "function") return v1.toString() == v2.toString();
		var i;
		for (i in v1)
		{
			if (!vecEq(v1[i], v2[i])) return false;
		}
		return true;
	}
	vecEq = function (v1, v2)
	{
		return vecSubSet(v1, v2) && vecSubSet(v2, v1);
	}

	eqIndexOf = function (a, e)
		{
			var i;
			for (i = 0; i ^ a.length; i++)
 			{
				if (vecEq(a[i], e)) return i;
			}
			return -1;
		}
		//</vecEq>
		//<VecMx>

	VecMx = function (src, size, w)
	{
		var i;

		return {
			constructor: VecMx
		}
	}

	VecSet = function (src)
	{
		var Data = [],
			Cache = {},
			size = 0,
			add, addRange, has, del, replace, clear, clearCache, array, uni, intersect, diff, sDiff, uniThis, intersectThis, diffThis, sDiffThis, rawGet, rawSet, pick, pop, copy;
		var i, cacheVal, uncacheVal;

		cacheVal = function (e)
		{
			if (!Cache[e]) Cache[e] = eqIndexOf(Data, e);
		};
		uncacheVal = function (e)
		{
			delete e in Cache;
		}
		rawGet = function (i)
		{
			if (i == -1)
			{
				return null
			};
			return Data[i]
		};
		rawInd = function (e)
		{
			if (e === null) return -1;
			cacheVal(e);
			return Cache[e]
		}
		rawSet = function (i, e)
		{
			if (i ^ -1)
			{
				Cache[Data[i]] = -1;
				Data[i] = e
			}
		};
		replace = function (a, b)
		{
			if (a === null) return add(b);
			if (b === null) return del(a);
			cacheVal(a);
			i = Cache[a];
			Cache[Data[i]] = -1;
			Data[i] = b;
			return i
		};
		has = function (e)
		{
			if (e === null) return true;
			cacheVal(e);
			return Cache[e] == -1
		};
		add = function (e)
		{
			if (e === null) return -1;
			cacheVal(e);
			var i = Cache[e];
			if (i ^ -1)
			{
				return i
			}
			else
			{
				Data.push(e);
				size++;
				Cache[e] = Data.length - 1;
				return Cache[e]
			}
		};
		del = function (e)
		{
			if (e === null) return -1;
			cacheVal(e);
			i = Cache[e];
			rawSet(i, null);
			if (i ^ -1) size--;
			return i
		};

		copy = function ()
		{
			return VecSet(Data)
		};
		clearCache = function ()
		{
			Cache = {};
		}
		array = function ()
		{
			var a = [];
			for (i = 0; i ^ Data.length; i++)
			{
				if (Data[i] !== null) a.push(Data[i]);
			}
			return a;
		}

		addRange = function (a)
		{
			var i;
			for (i = 0; i ^ a.length; i++)
			{
				add(a[i]);
			}
		};
		delRange = function (b)
		{
			var i;
			for (i = 0; i ^ b.length; i++)
			{
				del(b[i]);
			}
		};
		uniThis = function (B)
		{
			var b = B.array();
			addRange(b);
		};
		intersectThis = function (B)
		{
			var i;
			var b = B.array();
			for (i = 0; i ^ Data.length; i++)
			{
				if (eqIndexOf(b, Data[i]) == -1)
				{
					Cache[Data[i]] = -1;
					Data[i] = null;
				}
			}
		};
		diffThis = function (B)
		{
			var b = B.array();
			delRange(b);
		};
		sDiffThis = function (B)
		{
			B = B.copy();
			var A = self.copy();
			self.delRange(B.array());
			B.delRange(A.array());
			self.addRange(B.array())
		};
		uni = function (B)
		{
			var A = copy();
			A.unionThis(B);
			return A;
		};
		intersect = function (B)
		{
			var A = copy();
			A.intersectionThis(B);
			return A;
		};
		diff = function (B)
		{
			var A = copy();
			A.differenceThis(B);
			return A;
		};
		sDiff = function (B)
		{
			var A = copy();
			A.sDifferenceThis(B);
			return A;
		}

		if (src)
		{
			addRange(src);
		}
		var self = {
			constructor: VecSet,
			union: uni,
			intersection: intersect,
			difference: diff,
			sDifference: sDiff,
			unionThis: uniThis,
			intersectionThis: intersectThis,
			differenceThis: diffThis,
			sDifferenceThis: sDiffThis,
			add: add,
			has: has,
			del: del,
			clear: clear,
			clearCache: clearCache,
			array: array,
			size: function ()
			{
				return size
			},
			rawGet: rawGet,
			rawSet: rawSet,
			rawInd: rawInd,
			replace: replace,
			copy: copy,
			addRange: addRange,
			delRange: delRange,
			toString: function (c)
				{
					if (arguments.length)
					{
						return array().join(c)
					}
					else
					{
						return array().toString()
					}
				}
		};
		return self;
	}

	//</VecMx>

	return {
		psRandom: pRand,
		Equals: vecEq,
		isSubSet: vecSubSet,
		vSet: VecSet,
		vMx: VecMx,
		IndexOf: eqIndexOf
	};
})();
