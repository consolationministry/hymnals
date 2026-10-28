-- 202610280010: update hymn stanzas, chorus and description.
ALTER TABLE public.hymns ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE public.hymns ADD COLUMN IF NOT EXISTS description_yoruba text;

UPDATE public.hymns SET verses_en=ARRAY['Alleluia, song of sweetness,
Voice of joy that cannot die;
Alleluia is the anthem,
Ever dear to choirs on high;
In the house of God abiding;
Thus they sing eternally.','Alleluia, Church victorious,
Thou may''st lift the joyful strain,
Alleluia, songs of triumph;
Well befit the ransom''d train,
Faint and feeble are our praises;
While in exile we remain.','Alleluia may not always;
Be our song while here below;
Alleluia, our transgressions,
Make us for a while forego;
For the solemn time is coming,
When our tears for sin must flow.','Therefore in our hymns we pray Thee;
Grant us, Blessed Trinity,
At the last to keep Thine Easter;
In our Home beyond the sky,
There to Thee for ever singing,
Alleluia joyfully.']::text[], chorus_en='', description_en='WESTMINSTER ABBEY 8.7.8.7.8.7' WHERE source_hymn_number=2;
UPDATE public.hymns SET verses_en=ARRAY['All hail the power of Jesus'' name,
Let angels prostrate fall;
Bring forth the royal diadem,
To crown Him Lord of all.','Crown Him, ye martyrs of our God,
Who from His altar call;
Extol Him in whose path ye trod,
And crown Him Lord of all.','Ye seed of Israel''s chosen race,
Ye ransomed from the fall,
Hail Him who saves you by His grace,
And crown Him Lord of all.','Sinners! whose love can ne''er forget,
The wormwood and the gall;
Go spread your trophies at His feet,
And crown Him Lord of all.','Let every kindred, every tribe,
On this terrestrial ball,
To Him all majesty ascribe,
And crown Him Lord of all.','O that with yonder sacred throng;
We at His feet may fall,
Join in the everlasting song,
And crown Him Lord of all!']::text[], chorus_en='', description_en='' WHERE source_hymn_number=3;
UPDATE public.hymns SET verses_en=ARRAY['Head of the church triumphant,
We joyfully adore Thee;
Till Thou appear, Thy members here,
Shall sing like those in glory;
We lift our hearts and voices,
With bless''d anticipation,
And cry aloud, and give to God;
The praise of our salvation.','While in affliction''s furnace,
And passing through the fire,
Thy love we praise in grateful lays,
Which ever brings us nigher:
We clap our hands, exulting;
In Thine almighty favour:
The love divine, that made us Thine,
Shall keep us Thine for ever.','Thou dost conduct Thy people;
Through torrents of temptation:
Nor will we fear, while Thou art near,
The fire of tribulation;
The world, with sin and Satan,
In vain our march opposes,
By Thee we shall break through them all,
And sing the song of Moses.','By faith we see the glory;
To which Thou shalt restore us,
The world despise, for that high prize,
Which Thou hast set before us;
And, if Thou count us worthy,
We each, with dying Stephen,
Shall see Thee stand at God''s,
Right hands,
To call us up to heaven.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=6;
UPDATE public.hymns SET verses_en=ARRAY['Holy, holy, holy, Lord God Almighty!
Early in the morning our song shall rise to Thee;
Holy, holy, holy merciful and mighty,
God in Three Persons, blessed Trinity!','Holy, holy, holy! all the saint adore Thee,
Casting down their golden crowns around the glassy sea;
Cherubim and Seraphim falling down before Thee,
Which wert and art, and ever-more shall be.','Holy, holy, holy!
Though the dark ness ide Thee,
Though the eye of sinful man Thy glory may not see,
Only thou art holy, there is none beside Thee,
Perfect in pow''r, in love, and purity.','Holy, holy, holy, Lord God Almighty!
All Thy works shall praise Thy name in earth and sky and sea;
Holy, holy, holy, merciful and mighty,
God in Three Persons, blessed Trinity!']::text[], chorus_en='', description_en='' WHERE source_hymn_number=7;
UPDATE public.hymns SET verses_en=ARRAY['All people that on earth do dwell,
Sing to the Lord with cheerful voice:
Him serve with mirth, His praise forth tell;
Come ye before Him and rejoice.','The Lord, ye know, is God indeed;
Without our aid he did us make,
We are His folk, He doth us feed;
And for His sheep he doth us take.','O enter then His gates with praise;
Approach with joy His courts unto;
Praise, laud, and bless His name always,
For it is seemly so to do.','For why? The Lord our God is good;
His mercy is for ever sure;
His truth at all times firmly stood,
And shall from age to age endure.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=8;
UPDATE public.hymns SET verses_en=ARRAY['How sweet the name of Jesus sounds,
Blessed be the name of the Lord;
It soothes my sorrows heals my wounds,
Blessed be the name of the Lord.','It makes the wounded spirit whole,
Blessed be the name of the Lord;
''Tis manna to the hungry soul,
Blessed be the name of the Lord.','It soothes the troubled sinner''s breast,
Blessed be the name of the Lord;
It gives the weary sweetest rest,
Blessed be the name of the Lord.','Then will I tell the sinners round,
Blessed be the name of the Lord;
What a dear Saviour I have found;
Blessed be the name of the Lord.']::text[], chorus_en='Blessed be the name, blessed be the name,
Blessed be the name of the Lord;
Blessed be the name, blessed be the name,
Blessed be the name of the Lord.
Blessed be the name, blessed be the name,
Blessed be the name of the Lord;
Blessed be the name, blessed be the name,
Blessed be the name of the Lord.
Blessed be the name, blessed be the name,
Blessed be the name of the Lord;
Blessed be the name, blessed be the name,
Blessed be the name of the Lord.
Blessed be the name, blessed be the name,
Blessed be the name of the Lord;
Blessed be the name, blessed be the name,
Blessed be the name of the Lord.', description_en='' WHERE source_hymn_number=9;
UPDATE public.hymns SET verses_en=ARRAY['Immortal, invisible, God only wise,
In light inaccessible hid from our eyes,
Most blessed, most glorious, the Ancient of Days,
Almighty, victorious, thy great name we praise.','Unresting, unhasting, and silent as light,
Nor wanting, nor wasting, Thou rulest in might;
Thy justice like mountains high soaring above,
Thy clouds which are fountains of goodness and love.','To all life thou givest-to both great and small,
In all life Thou livest, the true life of all;
We blossom and flourish as leaves on the tree,
And wither and perish-but nought changeth Thee.','Great Father of Glory, pure Father of Light,
Thine angels adore Thee, all veiling their sight,
All laud we would render, O help us to see,
''Tis only the splendor of light hideth Thee.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=11;
UPDATE public.hymns SET verses_en=ARRAY['I will praise the Lord for His love to me;
I am washed in the blood of my Redeemer,
In the fount that flows at the cross so free;
I am washed in the blood of my Redeemer.','I am saved by grace and to Him bro''t near;
I am washed in the blood of my Redeemer;
I would sing so loud that the world might hear,
I am washed in the blood of my Redeemer.','What a constant peace in my heart I feel,
I am washed in the blood of my Redeemer;
There''s a holy joy I can ne''er reveal,
I am washed in the blood of my Redeemer.','I will lift my voice while on earth I stay,
I am washed in the blood of my Redeemer;
Then my soul shall sing in the realms of day;
I am washed in the blood of my Redeemer.']::text[], chorus_en='Glory, glory, glory to the Lamb,
I am sav''d from sin and He makes me what I am;
Oh, glory, glory, glory to the Lamb,
I am washed in the blood of my Redeemer.
Glory, glory, glory to the Lamb,
I am sav''d from sin and He makes me what I am;
Oh, glory, glory, glory to the Lamb,
I am washed in the blood of my Redeemer.
Glory, glory, glory to the Lamb,
I am sav''d from sin and He makes me what I am;
Oh, glory, glory, glory to the Lamb,
I am washed in the blood of my Redeemer.
Glory, glory, glory to the Lamb,
I am sav''d from sin and He makes me what I am;
Oh, glory, glory, glory to the Lamb,
I am washed in the blood of my Redeemer.', description_en='' WHERE source_hymn_number=12;
UPDATE public.hymns SET verses_en=ARRAY['Let us with a gladsome mind,
Praise the Lord, for He is kind;
For His mercies still endure,
Ever faithful, ever sure.','He, with all-commanding might,
Filled the new-made world with light;
For His mercies still endure,
Ever faithful, ever sure.','All things living he doth feed,
His full hand supplies their need:
For His mercies still endure,
Ever faithful, ever sure.','He His chosen race did bless,
In the wasteful wilderness:
For His mercies still endure,
Ever faithful, ever sure.','Let us then with gladsome mind;
Praise the Lord, for He is kind:
For His mercies still endure,
Ever faithful, ever sure.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=13;
UPDATE public.hymns SET verses_en=ARRAY['To Thee, O Comforter divine,
For all Thy grace and pow''r benign;
Sing we Alleluia!','To Thee, whose faithful love had place;
In God''s great covenant of grace,
Sing we Alleluia!','To Thee, whose faithful pow''r doth heal,
Enlighten, sanctify and seal,
Sing we Alleluia!','To Thee, our teacher and our friend;
Our faithful leader to the end;
Sing we Alleluia!','To Thee, by Jesus Christ sent down;
Of all his gifts the sun and crown,
Sing we Alleluia!']::text[], chorus_en='', description_en='' WHERE source_hymn_number=20;
UPDATE public.hymns SET verses_en=ARRAY['To God be the glory, great things He hath done,
So loved He the world that He gave us His Son,
Who yielded His life an atonement for sin,
And open''d the Life Gate that all may go in.','O perfect redemption, the purchase of blood;
To every believer the promise of God;
The vilest offender who truly believes,
That moment from Jesus a pardon receives.','Great things He hath taught us, great things He hath done,
And great our rejoicing through;
Jesus the Son;
But purer, and higher, and greater will be,
Our wonder, our transport when;
Jesus we see.']::text[], chorus_en='Praise the Lord! Praise the Lord!
Let the earth hear His voice!
Praise the Lord! Praise the Lord!
Let the people rejoice!
O come to the Father, through;
Jesus the Son;
And give Him the glory! Great things, He hath done!
Praise the Lord! Praise the Lord!
Let the earth hear His voice!
Praise the Lord! Praise the Lord!
Let the people rejoice!
O come to the Father, through;
Jesus the Son;
And give Him the glory! Great things, He hath done!
Praise the Lord! Praise the Lord!
Let the earth hear His voice!
Praise the Lord! Praise the Lord!
Let the people rejoice!
O come to the Father, through;
Jesus the Son;
And give Him the glory! Great things, He hath done!', description_en='' WHERE source_hymn_number=21;
UPDATE public.hymns SET verses_en=ARRAY['For mercies, countless as the sands,
Which daily I receive;
From Jesus, my Redeemer''s hands,
My soul, what canst thou give?','Alas, from such a heart as mine,
What can I bring Him forth?
My best is stain''d and dyed with sin;
My all is nothing worth.','Yet his acknowledgement I''ll make;
For all He has bestow''d,
Salvation''s sacred cup I''ll take,
I ''ll call upon my God.','The best return for one like me,
So wretched and so poor,
Is from His gifts to draw a plea,
And ask Him still for more.','I cannot serve Him as I ought;
No works have I to boast;
Yet would I glory in the thought,
That I shall owe Him mos']::text[], chorus_en='', description_en='' WHERE source_hymn_number=22;
UPDATE public.hymns SET verses_en=ARRAY['Father of heav''n above,
Dwelling in light and love,
Ancient of days,n
Light unapproachable,
Love inexpressible,
Thee, the invisible,
Laud we and praise.','Christ the eternal Word,
Christ the incarnate Lord,
Saviour of all,
High throned above all height;
God of God, Light of Light,
Increate infinite,
On Thee we call.','O God, the Holy Ghost;
Whose fires of Pentecost,
Burn evermore,
In this far wilderness;
Leave us not comfortless;
Thee we love, Thee we bless,
Thee we adore.','Strike your harps, heav''nly pow''rs:
With your glad chants shall ours,
Trembling ascend:
All praise, O God, to Thee,
Three in One, One in Three,
Praise everlastingly,
World without end.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=23;
UPDATE public.hymns SET verses_en=ARRAY['Awake, my soul, to joyful lays;
And sing thy great Redeemer''s praise,
He justly claims a song from me,
His loving kindness, Oh, how free!','He saw me ruined by the fall,
Yet lov''d me not withstanding all;
He sav''d me from my lost estate,
His loving kindness, Oh how great!','Tho'' num''rous hosts of mighty foes;
Tho'' earth and hell my way oppose;
He safely leads my soul along,
His loving kindness, Oh, how strong!','When trouble, like a gloomy cloud;
Has gather''d thick and thunder loud,
He near my soul has always stood,
His loving kindness, Oh how good!','Often l feel my sinful heart,
Prone from my Jesus to depart,
And though l oft have Him forgot,
His loving kindness changes not.']::text[], chorus_en='', description_en='TRURO L.M' WHERE source_hymn_number=27;
UPDATE public.hymns SET verses_en=ARRAY['We give immortal praise,
To God the Father''s love;
For all our comforts here;
And better hopes above,
He sent His own eternal Son;
To die for sins that man had done.','To God the Son belongs;
Immortal glory too,
Who bought us with His blood;
From everlasting Woe;
And now He lives, and now He reigns,
And sees the fruit of all His pains.','To God the Spirit''s name;
Immortal worship give,
Whose new- creating pow''r;
Makes the dead sinner live,
His work completes the great design,
And fills the soul with joy divine.','Almighty God to Thee;
Be endless honours done,
The undivided Three;
And the mysterious One,
Where reason fails, with all her pow''r;
There faith prevails and love adores.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=28;
UPDATE public.hymns SET verses_en=ARRAY['King of glory, King of peace,
I will love thee;
And, that love may never cease,
I will move thee,
Thou hast granted my request;
Thou hast heard me;
Thou didst note my working breast,
Thou hast spared me.','Wherefore with my utmost art I will sing thee,
And the cream of all my heart I will bring thee,
Though my sins against me cried,
Thou didst clear me,
And alone, when they replied,
Thou didst hear me.','Seven whole days, not one in seven,
I will praise thee;
In my heart, though not in heav''n,
I can raise thee;
Small it is, in this poor sort,
To enrol thee;
E''en eternity''s too short,
To extol thee.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=29;
UPDATE public.hymns SET verses_en=ARRAY['Hark! Hark! the song the ransomed sing,
A new made song of praise;
The Lord the Lamb they glorify,
And these the strains they raise.','Made white by His redeeming blood,
Our heavenly garments shine;
Our minds, by Him enlightened, prove;
The power of truth divine.','By Jesus'' blood we overcame;
When satan''s host assailed;
Twas by the power of truth divine,
Our feeble arms prevailed.','Then be the Lamb of God adored;
The Lord of life and light!
To Him be glory, honour, power,
And majesty and might!']::text[], chorus_en='Glory to Him who loved us,
And washed us in His blood;
Who cleansed our souls from guilt and sin,
By that pure, living flood.', description_en='' WHERE source_hymn_number=30;
UPDATE public.hymns SET verses_en=ARRAY['Awake, my soul, and with the sun,
Thy daily stage of duty run;
Shake off dull sloth, and joyful rise,
To pay thy morning sacrifice.','Thy precious time mis-spent redeem;
Each present day thy last esteem;
Improve thy talent with due care;
For the great day thyself prepare.','Let all thy converse be sincere,
Thy conscience as the noontide clear;
Think how all seeing God thy ways,
And all thy secret thoughts surveys.','By influence of the light Divine,
Let thy own light to others shine;
Reflect all Heav''n''s propitious rays,
In ardent love and cheerful praise.','Wake and lift up thyself, my heart,
And with the angles bear thy part,
Who all night long unwearied sing,
High praise to the eternal King.','I wake, I wake, ye heav''nly choir,
May your devotion me inspire,
That I, like you, my age may spend,
Like you may on my God attend.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=31;
UPDATE public.hymns SET verses_en=ARRAY['Forth in Thy Name, O Lord I go,
My daily labour to pursue,
Thee, only Thee, resolved to know
In all I think, or speak, or do.','The task thy wisdom hath assigned,
O let me cheerfully fulfill,
In all my works Thy presence find,
And prove Thy acceptable will.','Preserve me from my calling''s snare,
And hide my simple heart above,
Above the thorns of choking care,
The gilded baits of worldly love.','Thee may I set at my right hand,
Whose eyes my inmost substance see,
And labour on at Thy command,
And offer all my works to Thee.','Give me to bear Thy easy yoke,
And every moment watch and pray,
And still to things eternal look,
And hasten to Thy glorious day.','For Thee delightfully employ,
Whate''er Thy bounteous grace hath giv''n,
And run my course with even joy,
And closely walk with Thee to heaven.']::text[], chorus_en='', description_en='WARRINGTON L.M.' WHERE source_hymn_number=32;
UPDATE public.hymns SET verses_en=ARRAY['Holy Father, hear me,
Thou art my defender,
Be thou ever near me,
Loving true, and tender.','Jesus, blessed Master,
Lord of life and glory,
Bid the hours fly faster,
Till l kneel before thee.','Comforter benignest,
Who abiding in me,
All my need divinest,
Move me, draw me win me.','Holy, Holy, Holy,
Come and leave me never,
Thine abode most lowly,
Only Thine for ever.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=34;
UPDATE public.hymns SET verses_en=ARRAY['Abide with me fast falls the eventide;
The darkness deepens, Lord, with me abide!
When other helpers fail, and comforts flee,
Help of the helpless, O abide with me.','Swift to its close ebbs out life''s little day,
Earth''s joys grow dim, its glories pass away;
Change and decay in all around I see,
O thou who changest not, abide with me!','Come not in terrors, as the King of kings,
But kind and good, with healing in Thy wings;
Tears for all woes, a heart for every plea;
Come, Friend of sinners, thus abide with me.','I need Thy presence every passing hour;
What but Thy grace can foil the tempter''s power?
Who like Thyself my guide and stay can be?
Through cloud and sunshine, O abide with me.','I fear no foe, with Thee at hand to bless;
Ills have no weight, and tears no bitterness;
Where is death''s sting? where, grave, thy victory?
I triumph still, if thou abide with me.','Hold Thou Thy Cross before my closing eyes,
Shine through the gloom, and point me to the skies;
Heaven''s morning breaks, and earth''s vain shadows flee;
In life, in death, O Lord, abide with me!']::text[], chorus_en='', description_en='' WHERE source_hymn_number=35;
UPDATE public.hymns SET verses_en=ARRAY['Father, breathe an evening blessing,
Ere repose our spirits seal;
Sin and want we come confessing,
Thou canst save, and Thou canst heal.','Though the night be dark and dreary,
Darkness cannot hide from Thee;
Thou art He, who never weary,
Watchest where thy people be.','Though destruction walk around us,
Though the arrow past us fly,
Angel-guards from Thee surround us;
We are safe, if Thou art nigh.','Never fail us nor forsake us;
May sweet sleep our strength renew,
And the fresh''ning morn awake us,
Thy lov''d service to pursue.','Father to Thy holy keeping,
Humbly we ourselves resign;
Saviour, who has slept our sleeping,
Make our slumbers pure as Thine.','Blessed Spirit, brooding o''er us,
Chase the darkness of our night,
Till the perfect day before us;
Breaks in everlasting light.']::text[], chorus_en='', description_en='STUTTGART 8.7.8.7' WHERE source_hymn_number=36;
UPDATE public.hymns SET verses_en=ARRAY['Glory to Thee, my God, this night,
For all the blessings of the light;
Keep me, O keep me, king of kings,
Beneath Thine own almighty wings.','Forgive me, Lord, for Thy dear son,
The ill that'' I this day have done;
That with the world, myself, and Thee,
I, ere I sleep, at peace may be.','O may my soul on Thee repose,
And may sweet sleep mine eyelids close,
Sleep that may more vigorous make;
To serve my God when I awake.','If in the night I sleepless lie,
My soul with heav''nly thoughts supply;
Let no ill dreams disturb my rest,
No pow''rs of darkness me molest.','Praise God, from whom all blessing flow,
Praise Him, all creatures here below;
Praise Him above, ye heav''nly host;
Praise Father, Son, and Holy Ghost.']::text[], chorus_en='', description_en='TALLIS CANON L.M.' WHERE source_hymn_number=37;
UPDATE public.hymns SET verses_en=ARRAY['Lead, kindly Light, amid the encircling gloom,
Lead Thou me on;
The night is dark, and I am far from home;
Lead Thou me on;
Keep Thou my feet; I do not ask to see,
The distant scene-one step enough for me.','I was not ever thus, nor pray''d that Thou,
Shouldst lead me on;
I lov''d to choose and see my path, but now,
Lead Thou me on;
I loved the garish day, and, spite of fears,
Pride ruled my will; remember not past years.','So long Thy pow''r hath bless''d me, sure it still,
Will lead me on;
O''er moor and fen, o''er crag and torrent, till,
The night is gone,
And with the morn those angel faces smile;
Which I have lov''d long since, and lost awhile.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=38;
UPDATE public.hymns SET verses_en=ARRAY['We are never, never weary of the grand old song;
Glory to God, Hallelujah;
We can sing it loud as ever, with our faith more strong,
Glory to God, Hallelujah.','We are lost amid the rapture of redeeming love,
Glory to God, Hallelujah!
We are rising on its pinions to the hills above;
Glory to God, Hallelujah!','We are going to a palace that is built of gold,
Glory to God, Hallelujah!
Where the King in all His splendour we shall soon behold;
Glory to God, Hallelujah!','There we''ll shout redeeming mercy in a glad new song,
Glory to God, Hallelujah!
There we''ll sing the praise of Jesus with the blood-wash''d throng,
Glory to God, Hallelujah!']::text[], chorus_en='O the children of the Lord have a right to shout and sing,
For the way is growing bright, and our souls are on the wing;
We are going by and by to the palace of the king;
Glory to God, Hallelujah!
O the children of the Lord have a right to shout and sing,
For the way is growing bright, and our souls are on the wing;
We are going by and by to the palace of the king;
Glory to God, Hallelujah!
O the children of the Lord have a right to shout and sing,
For the way is growing bright, and our souls are on the wing;
We are going by and by to the palace of the king;
Glory to God, Hallelujah!
O the children of the Lord have a right to shout and sing,
For the way is growing bright, and our souls are on the wing;
We are going by and by to the palace of the king;
Glory to God, Hallelujah!', description_en='' WHERE source_hymn_number=39;
UPDATE public.hymns SET verses_en=ARRAY['Jesus we love to meet,
On this Thy holy day;
We gather round Thy throne;
On this Thy holy day,
Thou art our heav''nly Friend,
Our pray''rs ascend to Thee;
Look on our spirits, Lord;
On this thy holy day.','Let us shake off dull sloth,
On this Thy holy day;
We kneel in reverence, Lord;
On this Thy holy day,
Our sins may Thou forgive,
And may Thou teach us, Lord;
To worship as we ought,
On this Thy holy day.','We listen to Thy word,
On this Thy holy day,
Bless all the words we hear;
On this thy holy day,
As we part, be with us,
Thy salvation impart;
To every heart, dear Lord;
On this Thy holy day.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=40;
UPDATE public.hymns SET verses_en=ARRAY['This is the day of light;
Let there be light today,
O Day-spring rise upon our night,
And chase its gloom away.','This is the day of rest:
Our failing strength renew;
On weary brain and troubled breast,
Shed Thou Thy fresh''ning dew.','This is the day of peace;
Thy peace our spirits fill;
Bid Thou the blasts of discord cease,
The waves of strife be still.','This is the day of pray''r,
Let earth to heav''n draw near;
Lift up our hearts to seek Thee there;
Come down to meet us here.','This is the first of days:
Send forth Thy quick''ning breath,
And wake dead souls to love and praise;
O vanquisher of death!']::text[], chorus_en='', description_en='' WHERE source_hymn_number=41;
UPDATE public.hymns SET verses_en=ARRAY['Blessed invitation from the King of Heav''n,
Blessed invitation by the Spirit giv''n;
Falling on the weary like refreshing dew,
Whosoe''er believeth, that means you.','Reconciliation thro'' His precious blood;
He hath wrought salvation blessed Son of God!
All the work is finished, there is naught to do,
But to claim the blessing, that means you.','Saving all who trust Him to the utter most,
Boasting is excluded, yet in Him we boast,
Soul, receive the message, wonderful and true,
Whoso''er believeth that means you.','Doubt His Word no longer, come to Him today,
Turning from your sins for evermore away;
Thro'' His boundless mercy, All shall be forgiv''n;
He will safely guide you home to Heav''n.','There in realms of glory we will sing His praise,
With the shout of triumph thro'' eternal days,
For the invitation, old yet ever new;
Glory, Hallelujah! That means you.']::text[], chorus_en='That means you, brother, that means you;
Trust the Saviour''s promise tried and true (my brother),
That means you, brother, that means you;
Whosoe''er believeth that means you.', description_en='' WHERE source_hymn_number=45;
UPDATE public.hymns SET verses_en=ARRAY['Come, oh come, when Christ is calling,
Linger not in paths of sin;
Sever ev''ry tie that binds you;
And the heav''nly race begin.','Come, oh come, while Christ is pleading;
Oh, what love His tones convey!
Will you slight His proffer''d mercy;
Will you longer from him stray!','Come, oh come, delay no longer,
For th'' accepted time is now;
Yield, oh yield yourself to Jesus,
And before His sceptre bow.']::text[], chorus_en='Calling now, calling now,
Hear the Saviour calling now;
Calling now, calling now,
Hear the Saviour calling now.
Calling now, calling now,
Hear the Saviour calling now;
Calling now, calling now,
Hear the Saviour calling now.
Calling now, calling now,
Hear the Saviour calling now;
Calling now, calling now,
Hear the Saviour calling now.', description_en='' WHERE source_hymn_number=46;
UPDATE public.hymns SET verses_en=ARRAY['Come to the Saviour make no delay;
Here in His word He has shown us the way;
Here in our midst He''s standing today,
Tenderly saying, Come.','Suffer the children! Oh, hear His voice!
Let ev''ry heart leap forth and rejoice,
And let us freely make Him our choice;
Do not delay, but come.','Think once again, He''s with us today;
Heed now His blest command, and obey,
Hear now His accents tenderly say,
Will you, my children, come?']::text[], chorus_en='Joyful, joyful, will the meeting be,
When from sin our hearts are pure and free;
And we shall gather, Saviour, with Thee,
In our eternal home.
Joyful, joyful, will the meeting be,
When from sin our hearts are pure and free;
And we shall gather, Saviour, with Thee,
In our eternal home.
Joyful, joyful, will the meeting be,
When from sin our hearts are pure and free;
And we shall gather, Saviour, with Thee,
In our eternal home.', description_en='' WHERE source_hymn_number=48;
UPDATE public.hymns SET verses_en=ARRAY['Just as I am, without one plea;
But that Thy blood was shed for me;
And that Thou bidd''st me come to Thee,
O Lamb of God, I come!','Just as I am, and waiting not,
To rid my soul of one dark blot,
To Thee, whose blood can cleanse each spot,
O Lamb of God, I come!','Just as I am, though tossed about;
With many a conflict, many a doubt,
Fighting and fears within, without,
O Lamb of God, I come!','Just as I am, poor, wretched, blind;
Sight, riches, healing of the mind,
Yea, all I need, in Thee to find,
O Lamb of God, I come!','Just as I am, Thou wilt receive,
Wilt welcome, pardon, cleanse, relieve;
Because Thy promise I believe,
O Lamb of God, I come!','Just as I am - Thy love unknown;
Has broken every barrier down,
Now to be Thine, yea, Thine alone,
O Lamb of God, I come!','Just as I am, of that free love
The breath, length, depth, and height to prove;
Here for a season, then above,
O Lamb of God, I come!']::text[], chorus_en='', description_en='' WHERE source_hymn_number=50;
UPDATE public.hymns SET verses_en=ARRAY['I''ve a message from the Lord,
Hallelujah!
The message unto you I''ll give,
''Tis recorded in His Word,
Hallelujah!
It is only that you look and live.','I''ve a message full of love,
Hallelujah!
A message, O my friend, for you;
''Tis a message from above,
Hallelujah!
Jesus said it - and I know ''tis true!','Life is offered unto thee,
Hallelujah!
Eternal life thy soul shall have,
If you''ll only look to Him,
Hallelujah!
Look to Jesus who alone can save.']::text[], chorus_en='Look and live, my brother, live!
Look to Jesus now and live,
''Tis recorded in His Word,
Hallelujah!
It is only that you look and live!
Look and live, my brother, live!
Look to Jesus now and live,
''Tis recorded in His Word,
Hallelujah!
It is only that you look and live!
Look and live, my brother, live!
Look to Jesus now and live,
''Tis recorded in His Word,
Hallelujah!
It is only that you look and live!', description_en='' WHERE source_hymn_number=51;
UPDATE public.hymns SET verses_en=ARRAY['Loving Saviour, hear my cry,
Hear my cry, hear my cry,
Trembling to Thine arms I fly;
O save me at the Cross!
I have sinn''d, but Thou hast died,
Thou hast died, Thou hast died,
In Thy mercy let me hide
O save me at the Cross!','Tho'' I perish I will pray;
I will pray, I will pray;
Thou of life the Living Way,
O save me at the cross!
Thou hast said Thy grace is free,
Grace is free, grace is free,
Have compassion, Lord on me;
O save me at the Cross!','Wash me in Thy cleansing blood,
Cleansing blood, cleansing blood;
Plunge me now beneath the flood:
O save me at the Cross!
Only faith will pardon bring,
Pardon bring, pardon bring;
In that faith to Thee I cling;
O save me at the Cross!']::text[], chorus_en='Lord Jesus, receive me,
No more would I grieve Thee,
Now, blessed Redeemer,
O save me at the Cross!
Lord Jesus, receive me,
No more would I grieve Thee,
Now, blessed Redeemer,
O save me at the Cross!
Lord Jesus, receive me,
No more would I grieve Thee,
Now, blessed Redeemer,
O save me at the Cross!', description_en='' WHERE source_hymn_number=52;
UPDATE public.hymns SET verses_en=ARRAY['I hear the Saviour say,
Thy strength indeed is small,
Child of weakness, watch and pray,
Find in Me thine all in all.','Lord, now indeed I find;
Thy pow''r, and Thine alone,
Can change the leper''s spots;
And melt the heart of stone.','For nothing good have I;
Where-by Thy grace to claim,
I''ll wash my garments white;
In the blood of Calvary''s Lamb.','When from my dying bed;
My ransomed soul shall rise,
Then Jesus paid it all!
Shall rend the vaulted skies.','And when, before the throne,
I stand in Him complete,
I''ll lay my trophies down;
All down at Jesus feet;
Jesus paid it all.']::text[], chorus_en='Jesus paid it all,
All to Him I owe;
Sin had left a crimson stain;
He washed it white as snow.
Jesus paid it all,
All to Him I owe;
Sin had left a crimson stain;
He washed it white as snow.
Jesus paid it all,
All to Him I owe;
Sin had left a crimson stain;
He washed it white as snow.
Jesus paid it all,
All to Him I owe;
Sin had left a crimson stain;
He washed it white as snow.
Jesus paid it all,
All to Him I owe;
Sin had left a crimson stain;
He washed it white as snow.', description_en='' WHERE source_hymn_number=54;
UPDATE public.hymns SET verses_en=ARRAY['There is a fountain fill''d with blood,
Drawn from Immanuel''s veins,
And sinners plung''d beneath that flood,
Lose all their gulty stains.','The dying thief rejoic''d to see;
That fountain in his day,
And there may I, though vile as he,
Wash all my sins away.','Thou dying Lamp; thy precious blood;
Shall never lose its pow''r,
Till all the ransomed Church of God,
Be saved to sin no more.','Then in a nobler, sweeter song,
I''ll sing Thy pow''r to save,
When this poor, lisping, stamn''ring tongue,
Lies silent in the grave.']::text[], chorus_en='He was wounded for our transgressions,
He was bruised for our iniquities,
The chastisement of our peace was upon Him,
And with His stripes we are heal''d,
He was wounded for our transgressions,
He was wounded for our transgressions,
And with His stripes we are heal''d,
With His stripes we are heal''d.
He was wounded for our transgressions,
He was bruised for our iniquities,
The chastisement of our peace was upon Him,
And with His stripes we are heal''d,
He was wounded for our transgressions,
He was wounded for our transgressions,
And with His stripes we are heal''d,
With His stripes we are heal''d.
He was wounded for our transgressions,
He was bruised for our iniquities,
The chastisement of our peace was upon Him,
And with His stripes we are heal''d,
He was wounded for our transgressions,
He was wounded for our transgressions,
And with His stripes we are heal''d,
With His stripes we are heal''d.
He was wounded for our transgressions,
He was bruised for our iniquities,
The chastisement of our peace was upon Him,
And with His stripes we are heal''d,
He was wounded for our transgressions,
He was wounded for our transgressions,
And with His stripes we are heal''d,
With His stripes we are heal''d.', description_en='' WHERE source_hymn_number=55;
UPDATE public.hymns SET verses_en=ARRAY['If you are tired of the load of your sin,
Let Jesus come into your heart;
If you desire a new life to begin,
Let Jesus come into your heart.','If ''tis for purity now that you sigh,
Let Jesus come into your heart;
Fountains for cleaning are flowing near by,
Let Jesus come into your heart.','If there''s a tempest your voice cannot still,
Let Jesus come into your heart;
If there''s a void this world never can fill;
Let Jesus come into your heart.','If friends, once trusted, have proven untrue,
Let Jesus come into your heart;
Find what a Friend He will be unto you,
Let Jesus come into your heart.','If you would join the glad songs of the blest,
Let Jesus come into your heart;
If you would enter the mansion of rest,
Let Jesus come into your heart.']::text[], chorus_en='Just now, your doubting give o''er,
Just now, reject Him no more;
Just now, throw open the door;
Let Jesus come into your heart.
Just now, your doubting give o''er,
Just now, reject Him no more;
Just now, throw open the door;
Let Jesus come into your heart.
Just now, your doubting give o''er,
Just now, reject Him no more;
Just now, throw open the door;
Let Jesus come into your heart.
Just now, your doubting give o''er,
Just now, reject Him no more;
Just now, throw open the door;
Let Jesus come into your heart.
Just now, your doubting give o''er,
Just now, reject Him no more;
Just now, throw open the door;
Let Jesus come into your heart.', description_en='' WHERE source_hymn_number=56;
UPDATE public.hymns SET verses_en=ARRAY['All that draw me I have left behind;
Here in Canaan better joys I find;
Peace abiding, blessings unconfined,
For I''m living in Canaan now.','Sale abiding I will never fear,
For my Saviour ever will be near;
When I call Him He will always hear;
For I''m living in Canaan now.','I am drinking from a ceaseless well,
Here in Canaan where I love to dwell,
So to others I am glad to tell,
That I''m living in Canaan now.','Praises ever I am glad to bring;
Unto Jesus, my Redeemer, King,
For His mercies I will shout and sing,
For I''m living in Canaan now.']::text[], chorus_en='I am living in Canaan now;
Where the showers of blessing abound;
Where the riches of grace in plenty are found,
I am living in Canaan now.
I am living in Canaan now;
Where the showers of blessing abound;
Where the riches of grace in plenty are found,
I am living in Canaan now.
I am living in Canaan now;
Where the showers of blessing abound;
Where the riches of grace in plenty are found,
I am living in Canaan now.
I am living in Canaan now;
Where the showers of blessing abound;
Where the riches of grace in plenty are found,
I am living in Canaan now.', description_en='LIVING IN CANAAN 9.9.9.8.' WHERE source_hymn_number=57;
UPDATE public.hymns SET verses_en=ARRAY['What a wonderful change in my life has been wrought;
Since Jesus came into my heart!
I have light in my soul,
Which so long I had sought.','I have ceased from my wand''ring and going astray;
Since Jesus came into my heart,
And my sins which were many are all washed away;
Since Jesus came into my heart!','I''m possessed of a hope that is steadfast and sure;
Since Jesus came into my heart!
And no dark clouds of doubt now my pathway obscure,
Since Jesus came into my heart!','I shall go there to dwell in that city I know;
Since Jesus came into my heart!
And I''m happy, so happy as onward I go;
Since Jesus came into my heart!']::text[], chorus_en='Since Jesus came into my heart!
Since Jesus came into my heart!
Since Jesus came into my heart;
Floods of joy o''er my soul like the sea billows roll,
Since Jesus came into my heart.
Since Jesus came into my heart!
Since Jesus came into my heart!
Since Jesus came into my heart;
Floods of joy o''er my soul like the sea billows roll,
Since Jesus came into my heart.
Since Jesus came into my heart!
Since Jesus came into my heart!
Since Jesus came into my heart;
Floods of joy o''er my soul like the sea billows roll,
Since Jesus came into my heart.
Since Jesus came into my heart!
Since Jesus came into my heart!
Since Jesus came into my heart;
Floods of joy o''er my soul like the sea billows roll,
Since Jesus came into my heart.', description_en='' WHERE source_hymn_number=61;
UPDATE public.hymns SET verses_en=ARRAY['Grace! ''tis a charming sound,
Harmonious to the ear,
Heaven with the echo shall resound,
And all the earth shall hear.','Twas grace that wrote my name;
In Thy eternal book;
Twas grace that gave me to the Lamb,
Who all my sorrows took.','Grace taught my wand''ring feet,
To tread the heav''nly road;
And new supplies each hour I meet,
While pressing on to God.','Grace taught my soul to pray,
And made mine eyes o''erflow;
Twas grace which kept me to this day,
And will not let me go.','Oh, let Thy grace inspire;
My soul with strength Divine!
May all my pow''rs to Thee aspire,
And all my days be Thine.']::text[], chorus_en='Saved by grace alone!
This is all my plea:
Jesus died for all mankind,
And Jesus died for me.
Saved by grace alone!
This is all my plea:
Jesus died for all mankind,
And Jesus died for me.
Saved by grace alone!
This is all my plea:
Jesus died for all mankind,
And Jesus died for me.
Saved by grace alone!
This is all my plea:
Jesus died for all mankind,
And Jesus died for me.
Saved by grace alone!
This is all my plea:
Jesus died for all mankind,
And Jesus died for me.', description_en='' WHERE source_hymn_number=63;
UPDATE public.hymns SET verses_en=ARRAY['In tenderness He sought me,
Weary and sick with sin,
And on His shoulders brought me;
Back to His fold again,
While angels in His presence sang,
Until the courts of heaven rang.
Oh, the love that sought me!
Oh, the blood that brought me!
Oh, the grace that brought me to the fold.
Wondrous grace that brought me to the fold!','He washed the bleeding sin wounds,
And poured in oil and wine;
He whispered to assure me,
I''ve found thee, thou art Mine;
I never heard a sweeter voice,
It made my aching heart rejoice!','He pointed to the nail-prints,
For me His blood was shed,
A mocking crown so thorny,
Was placed upon His head:
I wondered what He saw in me,
To suffer such deep agony.','I''m sitting in His presence,
The sunshine of His face,
While with adoring wonder;
His blessings I retrace,
It seems as if eternal days;
Are far too short to sound His praise.','So while the hours are passing,
All now is perfect rest;
I''m waiting for the morning,
The brightest and the best,
When He will call us to His side,
To be with Him, His spotless bride.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=65;
UPDATE public.hymns SET verses_en=ARRAY['Lord, in this Thy mercy''s day;
Ere the time shall pass away,
On our knees we fall and pray.','Holy Jesus grant us tears,
Fill us with heart-searching fears,
Ere the hour of doom appears.','Lord, on us Thy Spirit pour,
Kneeling lowly at Thy door,
Ere it close for evermore.','By Thy night of agony;
By Thy supplicating cry,
By Thy willingness to die.','By Thy tears of bitter woe,
For Jerusalem below;
Let us not Thy love forgo.','Judge and Saviour of our race,
When we see Thee face to face,
Grant us neath Thy wings a place.','On Thy love we rest alone;
And that love will then be known;
By the pardon''d round Thy throne.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=69;
UPDATE public.hymns SET verses_en=ARRAY['What can wash away my sin?
Nothing but the blood of Jesus!
What can make me whole again?
Nothing but the blood of Jesus!','For my cleansing this I see-
Nothing but the blood of Jesus!
For my pardon this my plea-
Nothing but the blood of Jesus!','Nothing can for sin atone-
Nothing but the blood of Jesus!
Nought of good that I have done-
Nothing but the blood of Jesus!','This is all my hope and peace-
Nothing but the blood of Jesus!
This is all my righteousness;
Nothing but the blood of Jesus!']::text[], chorus_en='Oh precious is the flow,
That makes me white as snow!
No other fount I know;
Nothing but the blood of Jesus!
Oh precious is the flow,
That makes me white as snow!
No other fount I know;
Nothing but the blood of Jesus!
Oh precious is the flow,
That makes me white as snow!
No other fount I know;
Nothing but the blood of Jesus!
Oh precious is the flow,
That makes me white as snow!
No other fount I know;
Nothing but the blood of Jesus!', description_en='' WHERE source_hymn_number=72;
UPDATE public.hymns SET verses_en=ARRAY['Have you been to Jesus for the cleansing power?
Are you wash''d in the blood of the Lamb?
Are you fully trusting in His grace this hour?
Are you wash''d in the blood of the Lamb?','Are you walking daily by the Saviour''s side?
Are you wash''d in the blood of the Lamb?
Do you rest each moment in the Crucified?
Are you wash''d in the blood of the Lamb?','When the Bridegroom cometh will your robes be white?
Pure and white in the blood of the Lamb?
Will your soul be ready for the mansions bright,
And be washed in the blood of the Lamb?','Lay aside the garments that are stained with sin.
And be washed in the blood of the Lamb!
There''s a fountain flowing for the soul unclean,
Oh, be washed in the blood of the Lamb!']::text[], chorus_en='Are you wash''d in the blood,
In the soul-cleansing blood of the Lamb?
Are your garments spotless?
Are they white as snow?
Are you wash''d in the blood of the Lamb?
Are you wash''d in the blood,
In the soul-cleansing blood of the Lamb?
Are your garments spotless?
Are they white as snow?
Are you wash''d in the blood of the Lamb?
Are you wash''d in the blood,
In the soul-cleansing blood of the Lamb?
Are your garments spotless?
Are they white as snow?
Are you wash''d in the blood of the Lamb?
Are you wash''d in the blood,
In the soul-cleansing blood of the Lamb?
Are your garments spotless?
Are they white as snow?
Are you wash''d in the blood of the Lamb?', description_en='' WHERE source_hymn_number=73;
UPDATE public.hymns SET verses_en=ARRAY['I gave My life for thee,
My precious blood I shed,
That thou might''st ransomed be,
And quicken''d from the dead;
I gave My life for thee;
What hast thou giv''n for Me?','I spent long years for thee,
In weariness and woe,
That an eternity;
Of joy thou mightest know,
I spent long years for thee;
Hast thou spent one for Me?','My Father''s home of light,
My rainbow-circled throne;
I left, for earthly night,
For wand''rings sad and lone;
I left it all for thee;
Hast Thou left aught for Me?','I suffer''d much for thee,
More than thy tongue can tell;
Of bit''rest agony,
To rescue thee from hell,
I suffered much for thee;
What canst thou bear for Me?','And I have brought to thee,
Down from My home above,
Salvation full and free,
My pardon and My love;
Great gifts I brought to thee;
What hast thou brought to Me?','Oh, let thy life be given,
Thy years for Me be spent,
World-fetters all be riven,
And joy with suffering blent;
I gave Myself for thee;
Give thou thyself to Me.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=75;
UPDATE public.hymns SET verses_en=ARRAY['Jesus, I my cross have taken,
All to leave, and follow Thee;
Destitute, despis''d, forsaken,
Thou from hence my All shalt be:
Perish every fond ambition,
All I''ve sought, or hop''d, or known,
Yet how rich is my condition!
God and Heav''n are still my own!','Man may trouble and distress me,
''Twill but drive me to Thy breast;
Life with trials, hard may press me,
Heav''n''s will bring me sweeter rest!
Oh! ''tis not in grief to harm me,
While Thy love is left to me!
Oh! ''twere not in joy to charm me,
Were that joy unmixed with Thee!','Take, my soul, thy full Salvation,
Rise o''er sin and fear and care;
Joy to find in every station,
Something still to do or bear,
Think what Spirit dwells within thee!
What a Father''s smile is thine!
What a Saviour died to win thee!
Child of Heav''n, shouldst thou repine?','Haste then on from grace to glory,
Arm''d by faith, and wing''d by pray''r,
Heav''n Eternal Day''s before thee,
God''s own Hand shall guide thee there!
Soon shall close thy earthly mission,
Swift shall pass thy pilgrim days,
Hope soon change to glad fruition,
Faith to sight and pray''r to praise.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=76;
UPDATE public.hymns SET verses_en=ARRAY['Take my life, and let it be;
Consecrated, Lord, to Thee,
Take my moments and my days;
Let them flow in ceaseless praise.','Take my hands, and let them move;
At the impulse of Thy love,
Take my feet, and let them be,
Swift and beautiful for Thee.','Take my voice, and let me sing;
Always, only for my King,
Take my lips, and let them be,
Filled with messages from Thee.','Take my silver and my gold;
Not a mite would I withhold,
Take my intellect, and use;
Every pow''r as Thou shalt choose.','Take my will, and make it Thine,
It shall be no longer mine,
Take my heart - it is Thine own;
It shall be Thy royal throne.','Take my love; my Lord, I pour;
At Thy feet its treasure-store,
Take myself, and I will be,
Ever, only, all for Thee!']::text[], chorus_en='', description_en='' WHERE source_hymn_number=77;
UPDATE public.hymns SET verses_en=ARRAY['All to Jesus I surrender,
All to Him I freely give,
I will ever love and trust Him;
In His presence daily live.','All to Jesus I surrender,
Humbly at His feet I bow,
Worldly pleasures all forsaken,
Take me, Jesus take me now.','All to Jesus I surrender,
Make me, Saviour, wholly Thine,
Let me feel the Holy Spirit,
Truly know that Thou art mine','All to Jesus I surrender,
Lord, I give myself to Thee,
Fill me with Thy love and power,
Let Thy blessing fall on me.','All to Jesus I surrender,
Now I feel the sacred flame,
Oh, the joy of full salvation;
Glory, glory to His name!']::text[], chorus_en='I surrender all,
I surrender all,
All to Thee, my blessed Saviour,
I surrender all.
I surrender all,
I surrender all,
All to Thee, my blessed Saviour,
I surrender all.
I surrender all,
I surrender all,
All to Thee, my blessed Saviour,
I surrender all.
I surrender all,
I surrender all,
All to Thee, my blessed Saviour,
I surrender all.
I surrender all,
I surrender all,
All to Thee, my blessed Saviour,
I surrender all.', description_en='' WHERE source_hymn_number=78;
UPDATE public.hymns SET verses_en=ARRAY['When you start for the land of heavenly rest,
Keep close to Jesus all the way;
For He is the Guide, and he knows the way best,
Keep close to Jesus all the way.','Never mind the storms or trials as you go,
Keep close to Jesus all the way;
''Tis a comfort and joy His favour to know,
Keep close to Jesus all the way.','To be safe from the darts of the evil one,
Keep close to Jesus all the way;
Take the shield of faith till the victory`is own,
Keep close to Jesus all the way.','We shall reach our home in heaven by and by,
Keep close to Jesus all the way;
Where to those we love we''ll never say goodbye,
Keep close to Jesus all the way.']::text[], chorus_en='Keep close to Jesus, keep close to Jesus,
Keep close to Jesus all the way,
By day or by night never turn from the right;
Keep close to Jesus all the way.
Keep close to Jesus, keep close to Jesus,
Keep close to Jesus all the way,
By day or by night never turn from the right;
Keep close to Jesus all the way.
Keep close to Jesus, keep close to Jesus,
Keep close to Jesus all the way,
By day or by night never turn from the right;
Keep close to Jesus all the way.
Keep close to Jesus, keep close to Jesus,
Keep close to Jesus all the way,
By day or by night never turn from the right;
Keep close to Jesus all the way.', description_en='' WHERE source_hymn_number=79;
UPDATE public.hymns SET verses_en=ARRAY['Jesus calls us! O''er the tumult,
Of our life''s wild restless sea;
Day by day His sweet voice soundeth,
Saying: Christian, follow me.','As, of old, apostles heard it;
By the Galilean lake,
Turned from home and toil and kindred,
Leaving all for his dear sake.','Jesus calls us from the worship;
Of the vain world''s golden store,
From each idol that would keep us,
Saying: Christian, love me more!','In our joys and in our sorrows,
Days of toil and hours of ease;
Still He calls, in cares and pleasures,
That we love Him more than these.','Jesus calls us! By Thy mercies,
Saviour, make us hear Thy call,
Give our hearts to Thine obedience,
Serve and love Thee best of all.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=80;
UPDATE public.hymns SET verses_en=ARRAY['Take up thy cross, the Saviour said,
If thou wouldst my disciples be;
Deny thyself, the world forsake,
And humble follow after me.','Take up thy cross: let not its weight;
Fill thy weak spirit with alarm;
His str''nght shall bear thy spirit up,
And brace thy heart, and nerve thine arm.','Take up thy cross: nor heed the shame,
Nor let thy foolish pride rebel;
Thy Lord for thee the Cross endured,
To save thy soul from death and hell.','Take up thy cross then in His strength,
And calmly every danger brave;
Twill guide thee to a better home,
And lead to victory o''er the grave.','Take up thy cross, and follow Christ,
Nor think till death to lay it down;
For only he who bears the cross;
May hope to wear the glorious crown.','To Thee, Great Lord, the One in Three,
All praise for evermore ascend;
O grant us in our Hope to see,
The heav''nly life that knows no end.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=81;
UPDATE public.hymns SET verses_en=ARRAY['Though the world allure with its gilded charm,
I''m a child of God, whom it cannot harm;
He will me uphold by His mighty arm,
Every moment of my day.','I can ne''er forget how upon the tree,
Laid the son of God, there to die for me;
Yet to save my soul, thus it had to be,
There could be no other way.','I would e''er be true to my Lord and King,
Every waking hour praise to Him sing,
Knowing that at last He my soul shall bring,
Ever more with Him to stay.']::text[], chorus_en='I''ve a friend who will ev''ry need supply,
I''ve a home far beyond the starry sky,
And you know, that is just the reason why,
I am singing Hallelujah!
I''ve a friend who will ev''ry need supply,
I''ve a home far beyond the starry sky,
And you know, that is just the reason why,
I am singing Hallelujah!
I''ve a friend who will ev''ry need supply,
I''ve a home far beyond the starry sky,
And you know, that is just the reason why,
I am singing Hallelujah!', description_en='' WHERE source_hymn_number=82;
UPDATE public.hymns SET verses_en=ARRAY['When upon life''s billows you are tempest tossed,
When you are discouraged, thinking all is lost,
Count your many blessings, name them one by one,
And it will surprise you what the Lord hath done.','Are you ever burdened with a load of care?
Does the cross seem heavy you are called to bear?
Count your many blessings, every doubt will fly,
And you will be singing as the days go by.','When you look at others with their lands and gold,
Think that Christ has promised you His wealth untold;
Count your many blessings, money can not buy;
Your reward in Heaven, nor your home on high.','So, amid the conflict, whether great or small,
Do not discouraged, God is over all;
Count your many blessings, angels will attend,
Help and comfort give you to your journey''s end.']::text[], chorus_en='Count your blessing, name them one by one,
Count your blessing, see what God hath done;
Count your blessing, name them one by one,
Count your many blessing, see what God hath done.
Count your blessing, name them one by one,
Count your blessing, see what God hath done;
Count your blessing, name them one by one,
Count your many blessing, see what God hath done.
Count your blessing, name them one by one,
Count your blessing, see what God hath done;
Count your blessing, name them one by one,
Count your many blessing, see what God hath done.
Count your blessing, name them one by one,
Count your blessing, see what God hath done;
Count your blessing, name them one by one,
Count your many blessing, see what God hath done.', description_en='' WHERE source_hymn_number=83;
UPDATE public.hymns SET verses_en=ARRAY['Be glad in the Lord, and rejoice,
All ye that are upright in heart,
And ye that have made him your choice;
Bid sadness and sorrow depart.','Be joyful, for He is the lord,
On earth and in heaven supreme;
He fashions and rules by His word;
The ''Mighty'' and ''Strong'' to redeem.','What though in the conflict for right;
Your enemies almost prevail!
God''s armies, just hid from your sight,
Are more than the foes which assail.','Though darkness surround you by day,
Your sky by the night be o''er cast;
Let nothing your spirit dismay,
But trust till the danger is past.','Be glad in the lord and rejoice,
His praise proclaiming in song;
With harp, and with organ, and voice,
The loud hallelujahs prolong!']::text[], chorus_en='Rejoice! Rejoice!
Rejoice in the Lord and rejoice,
Rejoice! rejoice!
Rejoice in the Lord rejoice.
Rejoice! Rejoice!
Rejoice in the Lord and rejoice,
Rejoice! rejoice!
Rejoice in the Lord rejoice.
Rejoice! Rejoice!
Rejoice in the Lord and rejoice,
Rejoice! rejoice!
Rejoice in the Lord rejoice.
Rejoice! Rejoice!
Rejoice in the Lord and rejoice,
Rejoice! rejoice!
Rejoice in the Lord rejoice.
Rejoice! Rejoice!
Rejoice in the Lord and rejoice,
Rejoice! rejoice!
Rejoice in the Lord rejoice.', description_en='' WHERE source_hymn_number=84;
UPDATE public.hymns SET verses_en=ARRAY['Where He may lead me I will go,
For I have leaned to trust Him so,
And I remember ''twas for me,
That he was slain on Calvary.','O I delight His command,
Love to be led y His dear hand;
His divine will is sweet to me;
Hallowed by blood-stained Calvary.','Onward I go, nor doubt nor fear,
Happy with Christ my saviour near,
Trusting that I some day shall see;
Jesus my friend on Calvary.']::text[], chorus_en='Jesus shall lead me night and day,
Jesus shall lead me all the way,
He is the truest Friend to me,
For I remember Calvary.
Jesus shall lead me night and day,
Jesus shall lead me all the way,
He is the truest Friend to me,
For I remember Calvary.
Jesus shall lead me night and day,
Jesus shall lead me all the way,
He is the truest Friend to me,
For I remember Calvary.', description_en='' WHERE source_hymn_number=95;
UPDATE public.hymns SET verses_en=ARRAY['I can hear my Saviour calling,
I can hear my Saviour calling,
I can hear my Saviour calling,
Take thy cross, and follow, follow me.','I''ll go with Him thro'' the garden;
I''ll go with Him thro'' the garden,
I''ll go with Him thro'' the garden,
I''ll go with Him, with Him, all the way.','I''ll go with Him thro'' the judgment;
I''ll go with Him thro'' the judgment;
I''ll go with Him thro'' the judgment,
I''ll go with Him, with Him, all the way.','He will give me grace and glory,
He will give me grace and glory;
He will give me grace and glory,
And go with me, with me, all the way.']::text[], chorus_en='Where He leads me I will follow,
Where He leads me I will follow,
Where He leads me I will follow,
I''ll go with Him, with Him, all the way.
Where He leads me I will follow,
Where He leads me I will follow,
Where He leads me I will follow,
I''ll go with Him, with Him, all the way.
Where He leads me I will follow,
Where He leads me I will follow,
Where He leads me I will follow,
I''ll go with Him, with Him, all the way.
Where He leads me I will follow,
Where He leads me I will follow,
Where He leads me I will follow,
I''ll go with Him, with Him, all the way.', description_en='' WHERE source_hymn_number=98;
UPDATE public.hymns SET verses_en=ARRAY['Gladly, gladly, toiling for the Master
Go we forth with willing hands to do,
Whatsoe''er to us He hath appointed;
Faithfully our mission we''ll pursue.','Sweetly, sweetly, we will tell the story,
Of His love to mortals here below;
Christ, the brightness of the father''s glory;
Freely here His blessings will bestow.','Meekly, meekly, toiling for the Master,
Walking, faithfully the path He trod;
Leading wand''rers to the dear Redeemer;
Pointing sinners to the Lamb of God.']::text[], chorus_en='Toiling for Jesus,
Joyfully we go, yes, joyfully we go,
Toilling for Jesus,
In His vineyard here below.
Toiling for Jesus,
Joyfully we go, yes, joyfully we go,
Toilling for Jesus,
In His vineyard here below.
Toiling for Jesus,
Joyfully we go, yes, joyfully we go,
Toilling for Jesus,
In His vineyard here below.', description_en='' WHERE source_hymn_number=99;
UPDATE public.hymns SET verses_en=ARRAY['Come, labour on!
Who dares stand idle on the harvest plain,
While all around him waves the golden grain?
And to each servant does the Master say,
Go, work today!','Come, labour on!
Claim the high calling Angels cannot share,
To young and old the Gospelgladness bear;
Redeem the time: its hours too swiftly fly,
The night draws nigh.','Come, labour on!
The enemy is watching night and day,
To sow the tears, to snatch the seed away;
While we in sleep our duty have forgot,
He slumber''d not.','Come, labour on!
Away with gloomy doubts and faithless fear!
No arm so weak but may do service here,
By feeblest agents can our God fulfil;
His righteous will.','Come, labour on!
No time for rest, till glows the western sky,
Till the long shadows o''er our pathway lie,
And a glad sound comes with the setting sun;
Servants, well done!','Come, labour on!
The toil is pleasant, the reward is sure,
Blessed are those who to the end endure;
How full their joy, how deep their rest shall be,
O Lord, with Thee!']::text[], chorus_en='', description_en='' WHERE source_hymn_number=100;
UPDATE public.hymns SET verses_en=ARRAY['Anywhere with Jesus I can safely go;
Anywhere He leads me in this world below,
Anywhere without Him dearest joys would fade,
Anywhere with Jesus, I am not afraid!','Anywhere with Jesus I am not alone!
Other friends may fail me, He is still my own!
Though His hand may lead me over deariest ways;
Anywhere with Jesus is a house of praise!','Anywhere with Jesus I can go to sleep,
When the darking shadows round about me creep!
Knowing I shall waken, never more to roam;
Anywhere with Jesus will be home, sweet home!']::text[], chorus_en='Anywhere anywhere! Fear I cannot know;
Anywhere with Jesus I can safely go!
Anywhere anywhere! Fear I cannot know;
Anywhere with Jesus I can safely go!
Anywhere anywhere! Fear I cannot know;
Anywhere with Jesus I can safely go!', description_en='' WHERE source_hymn_number=101;
UPDATE public.hymns SET verses_en=ARRAY['Ho, my comrades! see the signal,
Waving in the sky!
Reinforcements now appearing,
Victory is nigh!','See the mighty host advancing,
Satan leading on:
Mighty men around us falling,
Courage almost gone!','See the glorious banner waving!
Hear the trumpet blow!
In our Leader''s name we''ll triumph;
Over every foe!','Fierce and long the battle rages,
But our help is near:
Onward comes our great Commander,
Cheer, my comrades, cheer!']::text[], chorus_en='Hold the fort, for I am coming!
Jesus signals still;
Wave the answer back to heaven,
By Thy grace we will!
Hold the fort, for I am coming!
Jesus signals still;
Wave the answer back to heaven,
By Thy grace we will!
Hold the fort, for I am coming!
Jesus signals still;
Wave the answer back to heaven,
By Thy grace we will!
Hold the fort, for I am coming!
Jesus signals still;
Wave the answer back to heaven,
By Thy grace we will!', description_en='' WHERE source_hymn_number=107;
UPDATE public.hymns SET verses_en=ARRAY['Christian! Seek not yet repose,
Hear thy guardian angel say,
Thou art in the midst of foes:
Watch and pray.','Principalities and powers,
Must''ring their unseen array,
Wait for thy unguarded hour:
Watch and pray.','Gird thy heavenly armour on;
Wear it ever, night and day;
Ambushed lies the evil one:
Watch and pray.','Hear the victors who o''ercame;
Still they mark each warrior''s way;
All with one consent exclaim,
Watch and pray.','Hear, above all, hear thy Lord,
Him thou lovest to obey;
Hide within thy heart His word:
Watch and pray.','Watch, as if on that alone,
Hung the issued of the day;
Pray, that help may be sent down;
Watch and pray.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=109;
UPDATE public.hymns SET verses_en=ARRAY['Conquerors and over comers now are we,
Thro'' the precious blood of Christ we''ve victory;
If the Lord be for us we can never fail,
Nothing ''gainst His mighty power can e''er prevail.','In the name of Israel''s God we''ll onward press;
Overcoming sin and all unrighteousness;
Not to us but unto Him the praise shall be,
For salvation and for blood bought victory.','Unto Him that overcometh shall be given,
Here to eat of hidden manna sent from Heaven,
Over yonder He the victors palm shall bear,
And a robe of white, and golden crown shall wear.']::text[], chorus_en='Conquerors are we, thro'' the blood of Jesus;
God will give us victory, thro'' the blood of Jesus,
Through the lamb for sinners slain,
Yet who lives and reign again,
More than conquerors are we,
More than conquerors are we.
Conquerors are we, thro'' the blood of Jesus;
God will give us victory, thro'' the blood of Jesus,
Through the lamb for sinners slain,
Yet who lives and reign again,
More than conquerors are we,
More than conquerors are we.
Conquerors are we, thro'' the blood of Jesus;
God will give us victory, thro'' the blood of Jesus,
Through the lamb for sinners slain,
Yet who lives and reign again,
More than conquerors are we,
More than conquerors are we.', description_en='' WHERE source_hymn_number=110;
UPDATE public.hymns SET verses_en=ARRAY['Christ, our mighty Captain, leads against the foe
We will never falter, when he bids us go;
Tho'' His righteous purpose we may never know,
Yet we''ll follow all the way.','Satan''s fearful onslaughts cannot make us yield;
While we trust in Christ, our Buckler and our shield,
Pressing ever on the spirit''s sword we wield,
And we follow all the way.','Let our glorious banner ever be unfurled,
From its mighty stronghold evil shall be hurled;
Christ, our mighty Captain, over comes the world,
And we follow all the way.','Fierce the battle rages, but ''twill not be long,
Then triumphant shall we join the blessed throng,
Joyfully uniting in the victor''s song;
If we follow all the way.']::text[], chorus_en='Forward! Forward! ''tis the Lords command,
Forward! forward to the promise land;
Forward! Forward! Let the chorus ring
We are sure to win with Christ our king.
Forward! Forward! ''tis the Lords command,
Forward! forward to the promise land;
Forward! Forward! Let the chorus ring
We are sure to win with Christ our king.
Forward! Forward! ''tis the Lords command,
Forward! forward to the promise land;
Forward! Forward! Let the chorus ring
We are sure to win with Christ our king.
Forward! Forward! ''tis the Lords command,
Forward! forward to the promise land;
Forward! Forward! Let the chorus ring
We are sure to win with Christ our king.', description_en='' WHERE source_hymn_number=111;
UPDATE public.hymns SET verses_en=ARRAY['The God who led His people thro'' the parted sea,
And from Egyptian bondage set His children free,
Who rain''d down from heaven all the pilgrim way;
Is the God to whom I pray.','The God who rescued Daniel from the lion''s den;
And from the fiery furnace sav''d the three young men,
Who speaks, and constellations will His voice obey,
Is the God to whom I pray.','The God who stills the tempest with a word divine,
And on the clouds of sorrow, makes His rainbows shine,
Who from the tomb of Jesus rolled the stone away;
Is the God to whom I pray.','The God who clothes the lily in its robe of snow;
Who in the barren desert makes His rivers flow,
The God who lifts the sinner from the miry clay;
Is the God to whom I pray']::text[], chorus_en='Just the same today, just the same today,
As when He led His people thro'' the sea,
His trustful child I''ll be,
For in His word I see,
The God who doeth wonders,
Is just the same today.
Just the same today, just the same today,
As when He led His people thro'' the sea,
His trustful child I''ll be,
For in His word I see,
The God who doeth wonders,
Is just the same today.
Just the same today, just the same today,
As when He led His people thro'' the sea,
His trustful child I''ll be,
For in His word I see,
The God who doeth wonders,
Is just the same today.
Just the same today, just the same today,
As when He led His people thro'' the sea,
His trustful child I''ll be,
For in His word I see,
The God who doeth wonders,
Is just the same today.', description_en='' WHERE source_hymn_number=112;
UPDATE public.hymns SET verses_en=ARRAY['Far away the noise of strife upon my ear is falling;
Then I know the sins of earth beset on ev''ry hand,
Doubt and fear and things of earth in vain to me are calling;
None of these shall move me from Beulah land.','Far below the storm of doubt upon the world is beating;
Sons of men in battle long the enemy withstand,
Safe am I within the castle of God''s world retreating;
Nothing then can reach me, ''tis Beulah land.','Let the storm breezes blow their cry cannot alarm me,
I am safely sheltered here protected by God''s hand,
Here the sun is always shining here there''s naught can harm me;
I am safe for ever in Beulah land.','Viewing here the works of God, I sink in contemplation;
Hearing now His blessed voice I see the way is planned;
Dwelling in the spirit, here I learn of full salvation,
Gladly will I tarry in Beulah land.']::text[], chorus_en='I''m living on the mountain, underneath a cloudless sky;
I''m drinking at the fountain that,
Never shall I''m feasting on the manna from a bountiful supply;
For I am dwelling in Beulah land.
I''m living on the mountain, underneath a cloudless sky;
I''m drinking at the fountain that,
Never shall I''m feasting on the manna from a bountiful supply;
For I am dwelling in Beulah land.
I''m living on the mountain, underneath a cloudless sky;
I''m drinking at the fountain that,
Never shall I''m feasting on the manna from a bountiful supply;
For I am dwelling in Beulah land.
I''m living on the mountain, underneath a cloudless sky;
I''m drinking at the fountain that,
Never shall I''m feasting on the manna from a bountiful supply;
For I am dwelling in Beulah land.', description_en='' WHERE source_hymn_number=113;
UPDATE public.hymns SET verses_en=ARRAY['Jesus is coming! Sing the glad word!
Coming for those He redeem''d by His blood,
Coming to reign as the glorified;
Lord! Jesus is coming again!','Jesus is coming! The dead shall arise,
Loved ones shall meet in a joyful surprise;
Caught up together to Him in the skies,
Jesus is coming again!','Jesus is coming! His saints to release,
Coming to give to the warring earth peace;
Sinning, and sighing, and sorrow, shall cease,
Jesus is coming again!','Jesus is coming! The promise is truth,
Who are the chosen, the faithful, the few;
Waiting and watching, prepared for review;
Jesus is coming again!']::text[], chorus_en='Jesus is coming, is coming again!
Jesus is coming again!
Shout the glad tidings o''er mountain and plain!
Jesus is coming again!', description_en='' WHERE source_hymn_number=114;
UPDATE public.hymns SET verses_en=ARRAY['Jesus is coming with joy to the sky;
Oh, happy day! oh, happy day!
Then all who love Him shall heavenward fly;
Oh, happy day! Happy day!
Upward shall fly to the Lord in the air,
Together with Jesus we all shall be there,
Far from the earth, and from sorrow and care;
Oh, happy day! Happy day!','Parents and children shall then again meet,
Oh, happy day! Oh happy day!
Sisters and brothers oh, it will be sweet!
Oh, happy day! Happy day!
We miss''d them on earth, to Jesus they went;
We love them as ever, their absence lament;
Soon we shall meet them, and then be content,
Oh, happy day! Happy day!','Are we all ready, should Jesus now call?
Oh! Happy day! oh happy day!
Would each one answer, the great and the small?
Oh, happy day! happy day!
We long to rise up and with Thee to be,
Thy face, blessed Jesus, our Saviour to see,
Would you then, dear children, sing sweetly with me?
Oh, happy day! happy day!','Some will stay weeping unable to sing,
Oh, happy day! oh happy day!
Yet all may rejoice their glad praises bring;
Oh, happy day! happy day!
For Jesus still waits, He tarries that we;
May trust in His name, and thus ready may be,
When brightly beaming, His glory we see;
Oh, happy day! happy day!']::text[], chorus_en='', description_en='' WHERE source_hymn_number=115;
UPDATE public.hymns SET verses_en=ARRAY['Jesus only is our message,
Jesus all our theme shall be,
We will lift up Jesus ever,
Jesus only will we see.','Jesus only is our Saviour,
All our guilt He bore away,
All our righteousness He gives us,
All our strength from day to day.','Jesus is our Sancifier,
Cleansing us from self and sin,
And with all His Spirit''s fullness,
Filling all our hearts within.','Jesus only is our Healer,
All our sicknesses he bare,
And His risen life and fullness,
All His members still may share.','Jesus only is our Power,
He is the gift of pentecost;
Jesus, breathe Thy power upon us,
Fill us with the Holy Ghost.','And for Jesus we are waiting,
Listening for the Advent call,
But ''twill still be Jesus only,
Jesus ever, all in all.']::text[], chorus_en='Jesus only, Jesus ever,
Jesus all in all we sing;
Saviour, Sanctifier, Healer,
Glorious Lord and coming King.
Jesus only, Jesus ever,
Jesus all in all we sing;
Saviour, Sanctifier, Healer,
Glorious Lord and coming King.
Jesus only, Jesus ever,
Jesus all in all we sing;
Saviour, Sanctifier, Healer,
Glorious Lord and coming King.
Jesus only, Jesus ever,
Jesus all in all we sing;
Saviour, Sanctifier, Healer,
Glorious Lord and coming King.
Jesus only, Jesus ever,
Jesus all in all we sing;
Saviour, Sanctifier, Healer,
Glorious Lord and coming King.
Jesus only, Jesus ever,
Jesus all in all we sing;
Saviour, Sanctifier, Healer,
Glorious Lord and coming King.', description_en='' WHERE source_hymn_number=116;
UPDATE public.hymns SET verses_en=ARRAY['When the trumpet of the Lord shall sound, and time shall be no more,
And the morning breaks, eternal, bright and fair;
When the saved of earth shall gather over on the other shore,
And the roll is called up yonder, I''ll be there.','On that bright and cloudless morning when the dead in Christ shall rise,
And the glory of His resurrection share;
When His chosen ones shall gather to their home beyond the skies,
And the roll is called up yonder, I''ll be there.','Let us labour for the Master from the dawn till setting sun,
Let us talk of all His wondrous love and care;
Then when all of life is over, and our work on earth is done,
And the roll is called up yonder, I''ll be there.']::text[], chorus_en='When the roll is called up yonder,
When the roll is called up yonder,
When the roll is called up yonder,
When the roll is called up yonder,
I''ll be there.
When the roll is called up yonder,
When the roll is called up yonder,
When the roll is called up yonder,
When the roll is called up yonder,
I''ll be there.
When the roll is called up yonder,
When the roll is called up yonder,
When the roll is called up yonder,
When the roll is called up yonder,
I''ll be there.', description_en='' WHERE source_hymn_number=117;
UPDATE public.hymns SET verses_en=ARRAY['When Jesus comes to reward His servants,
Whether it be noon or night,
Faithful to Him, will He find us watching,
With our lamps all trimmed and bright?','If, at the dawn of the early morning,
He shall call us one by one,
When to the Lord we restore our talents,
Will He answer thee - Well done?','Have we been true to the trust He left us?
Do we seek to do our best?
If in our hearts there is naught condemns us,
We shall have a glorious rest.','Blessed are those whom the Lord finds watching,
In His glory they shall share;
If He shall come at the dawn or midnight,
Will He find us watching there?']::text[], chorus_en='O can we say we are ready, brother,
Ready for the soul''s bright home?
Say, will He find you and me still watching;
Waiting, waiting when the Lord shall come?
O can we say we are ready, brother,
Ready for the soul''s bright home?
Say, will He find you and me still watching;
Waiting, waiting when the Lord shall come?
O can we say we are ready, brother,
Ready for the soul''s bright home?
Say, will He find you and me still watching;
Waiting, waiting when the Lord shall come?
O can we say we are ready, brother,
Ready for the soul''s bright home?
Say, will He find you and me still watching;
Waiting, waiting when the Lord shall come?', description_en='' WHERE source_hymn_number=118;
UPDATE public.hymns SET verses_en=ARRAY['When He cometh, when He cometh;
To make up His jewels,
All His jewels, precious jewels,
His loved and His own.','He will gather, He will gather;
The gems for His Kingdom,
All the pure ones all the bright ones,
His loved and His own.','Little children, little children;
Who love their Redeemer,
Are the jewels, precious jewels,
His loved and His own.']::text[], chorus_en='Like the stars of the morning,
His bright Crown adorning,
They shall shine in their beauty;
Bright gems for His Crown.
Like the stars of the morning,
His bright Crown adorning,
They shall shine in their beauty;
Bright gems for His Crown.
Like the stars of the morning,
His bright Crown adorning,
They shall shine in their beauty;
Bright gems for His Crown.', description_en='' WHERE source_hymn_number=119;
UPDATE public.hymns SET verses_en=ARRAY['More holiness give me, more strivings within:
More patience in suffering, more sorrow for sin:
More faith in my Saviour, more sense of His care:
More joy in His service, more purpose in prayer.','More gratitude give me, more trust in the Lord,
More zeal for His glory, more hope in His word;
More tears for His sorrows, more pain at His grief;
More meekness in trial, more praise for relief.','More purity give me, more strength to o''ercome;
More freedom from earth-stains, more longings for home,
More meet for Thy kingdom O Lord, would I be,
More fruitful, more holy, more Saviour, like Thee.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=120;
UPDATE public.hymns SET verses_en=ARRAY['Through the love of God our Saviour,
All will be well;
Free and changeless is His favour,
All, all is well:
Precious is the blood that heal''d us;
Perfect is the grace that seal''d us;
Strong the hand strech''d forth to shield us,
All must be well.','Thou we pass through tribulation,
All will be well;
Christ hath purchas''d full salvation,
All, all is well;
Happy still in God confiding;
Fruitful, if in Christ abiding;
Holy, through the Spirit''s guiding,
All must be well.','We expect a bright tomorrow;
All, will be well;
Faith can sing through days of sorrow,
All, all is well;
On our Father''s love relying,
Jesus every need supplying,
Then in living or in dying;
All must be well.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=122;
UPDATE public.hymns SET verses_en=ARRAY['They that trust in the Lord are secure,
Tho'' the storm rages dark o''er the sea;
For this anchor of promise is sure;
My grace is sufficient for thee.','What a boon to the pilgrim opprest,
What a balm such a promise must be;
To the laden ones seeking for rest,
My grace is sufficient for thee.','In the race for the prize, fainting soul,
Though a weary you bow down the knee,
Rise again, and press on to the goal;
My grace is sufficient for thee.','Neither trial nor doubt brings dismay,
Nor from danger that comes will I flee,
For I stand on this promise today,
My grace is sufficient for thee.']::text[], chorus_en='My grace is sufficient for thee,
My grace is sufficient for thee,
Oh, matchless, boundless grace of God,
My grace is sufficient for thee.
My grace is sufficient for thee,
My grace is sufficient for thee,
Oh, matchless, boundless grace of God,
My grace is sufficient for thee.
My grace is sufficient for thee,
My grace is sufficient for thee,
Oh, matchless, boundless grace of God,
My grace is sufficient for thee.
My grace is sufficient for thee,
My grace is sufficient for thee,
Oh, matchless, boundless grace of God,
My grace is sufficient for thee.', description_en='' WHERE source_hymn_number=132;
UPDATE public.hymns SET verses_en=ARRAY['He will answer every pray''r,
This, His promise and His will;
He has never chang''d nor fail''d;
Glory to His name.','He will answer every pray''r;
To His promise I will cling,
I know He''ll ne''er deceive me,
Glory to His name.','He will answer every pray''r,
Let us ask from Him in faith;
With his Holy Spirit''s help,
Glory to His name.','He will answer every pray''r;
Come thou to the mercy seat,
Blest assurance you''ll receive;
Glory to His name.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=125;
UPDATE public.hymns SET verses_en=ARRAY['Begone, unbelief,
My Saviour is near,
And for my relief;
Will surely appear:
By pray''r let me wrestle,
And He will perform;
With Christ in the vessels,
I smile at the storm.','Though dark be my way.
Since he is my Guide,
''Tis mine to obey,
''Tis His to provide;
Though cisterns be broken,
And creatures all fail,
The word He hath spoken;
Shall surely prevail.','His love, in time past;
Forbids me to think,
He''ll leave me at last;
In trouble to sink:
Each sweet Ebenezer;
I have in review,
Confirms His good pleasure,
To help me quit through.','Why should I complain;
Of want or distress,
Temptation or pain?
He told me no less;
The heirs of salvation,
I know from His Word,
Through much tribulation,
Must follow their lord.','How bitter that cup;
No heart can conceive,
Which He drank quit up,
That sinners might live!
His way was much rougher;
And darker than mine;
Did Christ, my lord, suffer,
And shall I repine?','Since all that I meet;
Shall work for my good,
The bitter is sweet,
The medicine, food,
Though painful at long present;
''Twill cease before long,
And then, Oh! how pleasant,
The conqueror''s song!']::text[], chorus_en='', description_en='' WHERE source_hymn_number=128;
UPDATE public.hymns SET verses_en=ARRAY['God moves in a mysterious way,
His wonders to perform;
He plants His footsteps in the sea,
And rides upon the storm.','Deep in unfathomable mines;
Of never-failing skill,
He treasures up His bright designs,
And works His sovereign will.','Ye fearful saints, fresh courage take,
The clouds ye so much dread;
Are big with mercy, and shall break;
In blessing on your head.','Judge not the lord by feeble sense,
But trust Him for His grace,
Behind a frowning providence;
He hides a smiling face.','His purpose will ripen fast,
Unfolding every hour;
The bud may have a bitter taste,
But sweet will be the flow''r.','Blind unbelief is sure to err,
And scan His work in vain;
God is His own interpreter,
And He will make it plain.']::text[], chorus_en='', description_en='ST. STEPHEN C.M.' WHERE source_hymn_number=131;
UPDATE public.hymns SET verses_en=ARRAY['How sweet the name of Jesus sounds;
In a beliver''s ear!
It soothes his sorrows, heals his wounds,
And drives away his fear.','It makes the wounded spirit whole,
And calms the troubled breast;
''Tis manna to the hungry soul,
And to the weary rest.','Dear name! The Rock on which I build,
My shield, and hiding place,
My never failing treasury,
Fill''d with boundless store of grace!','Jesus, my shepherd, Brother, friend,
My prophet, Priest, and king,
My lord, my life, my way, my End,
Accept the praise I bring.','Weak is the effort of my heart,
And cold my warmest though;
But when I see Thee as Thou art;
I''ll praise Thee as I ought.','Till then I would Thy love proclaim,
With every fleeting breath;
And may the music of Thy name,
Refresh my soul in death.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=137;
UPDATE public.hymns SET verses_en=ARRAY['I have found a Friend in Jesus,
He''s the everything to me,
He''s the fairest of ten thousand to my soul;
The lily of the valley, in Him alone I see
And I need to cleanse and make me fully whole.','He all my griefs has taken, and all my sorrows borne;
In temptation He''s my strong and mighty tower;
I have all for him forsaken, and all my idols torns,
From my heart,and now He keeps me by His power,
Though all the world forsake me, and satan tempt me sore;
Through Jesus I shall safely reach the goal:
He''s the lily of the valley, the Bright and Morning star,
He''s the fairest of ten thousand to my soul.','He will never, never leave me, nor yet forsake me here,
While I live by faith and do His blessed will;
A wall of fire about me, I''ve nothing now to fear;
With His manna He my hungry soul shall fill,
Then sweeping up to glory, to see his blessed face;
Where rivers of delight shall ever roll:
He''s the lily of the valley, the Bright and Morning star,
He''s the fairest of ten thousand to my soul.']::text[], chorus_en='In sorrow He''s my comfort in trouble He''s my stay,
He tells me every care on Him to roll:
He''s the lily of the valley, the Bright and Morning star,
He''s the fairest of ten thousand to my soul;
In sorrow he''s my comfort,
In trouble He my stay;
He tells me every care on him to roll:
He''s the lily of the valley,
The Bright and Morning star,
He''s the fairest of ten thousand to my soul.
In sorrow He''s my comfort in trouble He''s my stay,
He tells me every care on Him to roll:
He''s the lily of the valley, the Bright and Morning star,
He''s the fairest of ten thousand to my soul;
In sorrow he''s my comfort,
In trouble He my stay;
He tells me every care on him to roll:
He''s the lily of the valley,
The Bright and Morning star,
He''s the fairest of ten thousand to my soul.
In sorrow He''s my comfort in trouble He''s my stay,
He tells me every care on Him to roll:
He''s the lily of the valley, the Bright and Morning star,
He''s the fairest of ten thousand to my soul;
In sorrow he''s my comfort,
In trouble He my stay;
He tells me every care on him to roll:
He''s the lily of the valley,
The Bright and Morning star,
He''s the fairest of ten thousand to my soul.', description_en='' WHERE source_hymn_number=138;
UPDATE public.hymns SET verses_en=ARRAY['There is no friend like Jesus in this world;
Jesus is the only sincere Friend,
The Friend of this world will one day leave us,
But the Lord will never forget us.','Not caring for foes, the time is passing,
Drawing near to our home day by day,
The great judge will come the world will tremble;
There will be no excuse on that day.','Now, wait on the Lord never doubt again;
What ever now may betideth thee,
When there''s no more hope then His help will come;
Our Lord Jesus is wonderful King.']::text[], chorus_en='Oh: He''ll never forget us,
Oh: He''ll never forget us,
But the Lord will never forget us.
Oh: He''ll never forget us,
Oh: He''ll never forget us,
But the Lord will never forget us.
Oh: He''ll never forget us,
Oh: He''ll never forget us,
But the Lord will never forget us.', description_en='' WHERE source_hymn_number=139;
UPDATE public.hymns SET verses_en=ARRAY['What a Friend we have in Jesus,
All our sins and griefs'' to bear;
What a privilege to carry,
Everything to God in prayer!
O what peace we often forfeit;
O what needless pain we bear,
All because we do not carry,
Everything to God in prayer!','Have we trials and temptations!
Is there trouble anywhere?
We should never be discouraged;
Take it to the Lord in prayer;
Can we find a friend so faithful,
Who will all our sorrows share?
Jesus knows our every weakness:
Take it to the Lord in prayer.','Are we weak and heavy-laden,
Cumbered with a load of care;
Precious Saviour, still our refuge;
Take it to the Lord in prayer,
Do thy friends despise, forsake thee?
Take it to the Lord in prayer;
In His arms He''ll take and shield thee,
Thou wilt find a solace there.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=145;
UPDATE public.hymns SET verses_en=ARRAY['Lord, dismiss us with Thy blessing,
Fill our hearts with joy and peace;
Let us each, Thy love possessing,
Triumph in redeeming grace;
Oh refresh us, oh refresh us,
Traveling through this wilderness.','Thanks we give, and adoration,
For Thy Gospel''s joyful sound;
May the fruits of Thy salvation,
In our hearts and lives abound;
May Thy presence, may Thy presence;
With us evermore be found.','So, whene''er the signal''s given,
Us from earth to call away,
Borne on angels'' wings to heaven,
Glad the summons to obey,
May we ever, may we ever;
Reign with Christ in endless day.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=148;
UPDATE public.hymns SET verses_en=ARRAY['Guide me, O Thou great Jehovah,
Pilgrim through this barren land,
I am weak, but Thou art mighty;
Hold me with Thy pow''rful hand;
Bread of heaven! Bread of heaven!
Feed me now and evermore.','Open Thou the crystal fountain,
Whence the healing stream shall flow;
Let the fiery, cloudy pillar,
Lead me all my journey through:
Strong Deliverer! Strong Deliverer!
Be Thou still my help and shield.','When I tread the verge of Jordan,
Bid my anxious fears subside;
Death of deaths, and hell''s destruction;
Land me safe on Canaan''s side:
Song of praises Song of praises;
I will ever give to Thee.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=150;
UPDATE public.hymns SET verses_en=ARRAY['Sweet hour of prayer! Sweet hour of prayer!
That calls me from a world of care,
And bids me at my Father''s throne;
Make all my wants and wishes known;
In seasons of distress and grief,
My soul has often found relief,
And oft escaped the tempter''s snare,
By thy return, sweet hour of prayer.','Sweet hour of prayer! Sweet hour of prayer!
Thy wings shall my petition bear,
To Him whose truth and faithfulness
Engage the waiting soul to bless;
And since He bids me seek His face,
Believe His word and trust His grace,
I''ll cast on Him my every care,
And wait for thee, sweet hour of prayer.','Sweet hour of prayer! Sweet hour of prayer!
May I thy consolation share,
Till, from Mount Pisgah''s lofty height,
I view my home, and take my flight:
This robe of flesh I''ll drop, and rise
To seize the everlasting prize;
And shout, while passing through the air,
Farewell, farewell, sweet hour of prayer.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=152;
UPDATE public.hymns SET verses_en=ARRAY['Come, soul and find thy rest,
No longer be distress''d,
Come to thy Saviour''s breast,
O don''t stay away.','Dark is the world and cold,
Her cares cannot be told,
Come to Thy Saviour''s fold,
O don''t stay away.','Come with Thy load of sin,
Christ died Thy soul to win;
Now He will take Thee in,
O don''t stay away.','Time here will soon be past,
Moments are flying fast;
Judgment will come at last,
O don''t stay away.','Come, O we pray thee, come,
Come, and no longer roam;
Come now and start for Home,
O don''t stay away.']::text[], chorus_en='Pray''rs are ascending now;
Angels are bending low,
Both words are blending now,
O don''t stay away.
Pray''rs are ascending now;
Angels are bending low,
Both words are blending now,
O don''t stay away.
Pray''rs are ascending now;
Angels are bending low,
Both words are blending now,
O don''t stay away.
Pray''rs are ascending now;
Angels are bending low,
Both words are blending now,
O don''t stay away.
Pray''rs are ascending now;
Angels are bending low,
Both words are blending now,
O don''t stay away.', description_en='' WHERE source_hymn_number=154;
UPDATE public.hymns SET verses_en=ARRAY['In the hour of trial,
Jesus, pray for me,
Lest by base denial;
I depart from Thee,
When Thou seest me waver,
With a look recall,
Nor, for fear or favour,
Suffer me to fall.','With its witching pleasures;
Would this vain world charm,
Or its sordid treasures,
Spread to work me harm,
Bring to my remembrance;
Sad Gethsemane,
Or, in darker semblance,
Cross-crown''d Calvary.','If with sore affliction;
Thou in love chastise,
Pour Thy benediction,
On the sacrifice;
Then, upon Thine altar;
Freely offered up,
Though the flesh may falter,
Faith shall drink the cup.','When in dust and ashes;
To the grave I sink,
While Heav''ns glory flashes,
O''er the shelving brink,
On Thy truth relying;
Through that mortal strife,
Lord, receive me, dying,
To eternal life.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=156;
UPDATE public.hymns SET verses_en=ARRAY['Arm of the Lord! awake, awake!
Put on Thy strength, the nations shake:
And let the world, adoring, see;
Triumphs of mercy wrought by Thee.','Say to the heathen, from Thy Throne,
I am Jehovah, God alone!
Thy voice their idols shall confound,
And cast their altars to the ground.','Let Zion''s time of favour come;
Oh, bring the tribes of Israel home:
And let our wondering eyes behold,
Gentiles and Jews in Jesus'' fold!','Almighty God! Thy grace proclaim;
In every clime, of every name;
Let adverse pow''rs before Thee fall,
And crown the Saviour Lord of all.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=157;
UPDATE public.hymns SET verses_en=ARRAY['Go, labour on; spend, and be spent,
Thy joy to do the Father''s will:
It is the way the Master went;
Should not the servant tread it still?','Go, labour on; ''tis not for nought,
Thy earthly loss is heavenly gain:
Men heed thee, love thee, praise thee not;
The Master praises; what are men?','Go, labour on, while it is day;
The world''s dark night is hastening on:
Speed, speed thy work, cast sloth away;
It is not thus that souls are won.','Men die in darkness at your side,
Without a hope to cheer the tomb;
Take up the torch, and wave it wide,
The torch that lights time''s thickest gloom.','Toil on, faint not, keep watch, and pray;
Be wise, the erring soul to win;
Go forth into the world''s highway,
Compel the wanderer to come in.','Toil on, and in thy toil rejoice;
For toil comes rest, for exile home;
Soon shalt thou hear the Bridegroom''s voice,
The midnight peal, Behold, I come!']::text[], chorus_en='', description_en='GRENOBLE L.M' WHERE source_hymn_number=158;
UPDATE public.hymns SET verses_en=ARRAY['Thou whose almighty word;
Chaos and darkness heard,
And took their flight,
Hear us, we humbly pray,
And where the gospel day;
Sheds not its glorious ray,
Let there be light!','Thou who didst come to bring,
On Thy redeeming wing;
Healing and sight,
Health to the sick in mind,
Sight to the only blind,
O now to all mankind;
Let there be light!','Spirit of truth and love,
Life-giving holy Dove,
Speed forth Thy flight:
Move on the water''s face,
Spreading the beams of grace,
And in earth''s darkest place;
Let there be light!','Blessed and holy Three,
Glorious Trinity,
Grace, love, and might,
Boundless as ocean''s tide;
Rolling in fullest pride,
Through the world far and wide;
Let there be light!']::text[], chorus_en='', description_en='' WHERE source_hymn_number=159;
UPDATE public.hymns SET verses_en=ARRAY['Thy kingdom come, O God,
Thy rule, O Christ, begin:
Break with Thine iron rod;
The tyrannies of sin.','Where is Thy reign of peace,
And purity, and love?
When shall all hatred cease,
As in the realms above?','When comes the promised time;
6060That war shall be no more,
Oppression, lust, and crime;
Shall flee Thy face before?','We pray Thee, Lord, arise,
And come in Thy great might;
Revive our longing eyes,
Which languish for Thy sight.','Men scorn Thy sacred name,
And wolves devour Thy fold;
By many deeds of shame;
We learn that love grows cold.','O''er heathen lands afar,
Thick darkness broodeth yet;
Arise, O morning Star,
Arise, and never set']::text[], chorus_en='', description_en='' WHERE source_hymn_number=160;
UPDATE public.hymns SET verses_en=ARRAY['Blow ye the trumpet blow!
The gladly solemn sound;
Let all the nations know,
To earth''s remotest bound.','Extol the Lamb of God,
The all-atoning Lamb;
Redemption by His blood;
Throughout the world proclaim.','Ye, who have sold for nought;
Your heritage above,
Receive it back unbought,
The gift of Jesus'' love.','Jesus our great High Priest,
Has full atonement made;
Ye weary spirits, rest;
Ye mournful souls, be glad.','Hearts that are weary, come;
Rest on the Saviour''s breast,
Disconsolate heart, come,
Be cheerful and rejoice.']::text[], chorus_en='The year of jubilee is come!
The year of jubilee is come!
Return, ye ransomed sinners, home.
The year of jubilee is come!
The year of jubilee is come!
Return, ye ransomed sinners, home.
The year of jubilee is come!
The year of jubilee is come!
Return, ye ransomed sinners, home.
The year of jubilee is come!
The year of jubilee is come!
Return, ye ransomed sinners, home.
The year of jubilee is come!
The year of jubilee is come!
Return, ye ransomed sinners, home.', description_en='' WHERE source_hymn_number=161;
UPDATE public.hymns SET verses_en=ARRAY['Awake, and in His strength renewed,
The battle cry take up again;
All enemies shall be subdued,
And Christ the Lord shall reign.','Too long His follow''rs idly stood,
By selfish creed and doctrine rent;
Nor knew that for one Brotherhood,
His own short life was spent.','Unite and in His strength go on,
Nor count a life as lost, but gain;
And soon the vict''ry shall be won,
For Jesus Christ must reign.','To dare and do for Him is meet,
The struggle shall not be in vain,
The Trumpet shall not call Retreat,
For Jesus Christ must reign.']::text[], chorus_en='For Christ must reign,
For Christ must reign,
Our hope in Him is not in vain;
For Christ must reign,
For Christ must reign,
For Christ must reign,
Our hope in Him is not in vain;
For Christ must reign.
For Christ must reign,
For Christ must reign,
Our hope in Him is not in vain;
For Christ must reign,
For Christ must reign,
For Christ must reign,
Our hope in Him is not in vain;
For Christ must reign.
For Christ must reign,
For Christ must reign,
Our hope in Him is not in vain;
For Christ must reign,
For Christ must reign,
For Christ must reign,
Our hope in Him is not in vain;
For Christ must reign.
For Christ must reign,
For Christ must reign,
Our hope in Him is not in vain;
For Christ must reign,
For Christ must reign,
For Christ must reign,
Our hope in Him is not in vain;
For Christ must reign.', description_en='' WHERE source_hymn_number=162;
UPDATE public.hymns SET verses_en=ARRAY['The heathen perish; day by day,
Thousands on thousands pass away!
O Christians, to their rescue fly;
Preach Jesus to them ere they die.','Wealth, labour, talents, freely give,
Yea, life itself, that they may live;
What hath your Saviour done for you!
And what for Him will ye not do!','Thou Spirit of the Lord, go forth,
Call in the south, wake up the north;
In every clime, from sun to sun,
Gather God''s children into one.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=169;
UPDATE public.hymns SET verses_en=ARRAY['Jesus lives! Thy terrors now;
Can, o death, no more appalus,
Jesus lives! By this we know;
Thou, o grave, canst not enthral us,
Hallelujah!','Jesus lives! Henceforth is death,
Entrance-gate of life immortal;
This shall calm our trembling breath,
When we pass its gloomy portal;
Hallelujah!','Jesus lives! For us He died;
Hence may we, to Jesus living;
Pure in heart and act abide,
Praise to Him and glory giving,
Hallelujah!','Jesus lives! Our heart know well;
Nothing from us His love shall sever,
Life, nor death, nor pow''rs of hell,
Part us now from Christ forever,
Hallelujah!','Jesus lives! To Him the throne;
High o''er heav''en and earth is given:
We may go where He is gone;
Live and reign with Him in heaven,
Hallelujah.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=170;
UPDATE public.hymns SET verses_en=ARRAY['The strife is o''er the battle done:
The victory of life is won:
The song of triumph has begun,
Alleluia!','The pow''rs of death have done their Worst,
But Christ their legions hath Dispersed;
Let shout of holy joy outburst:
Alleluia!','The three sad days have quickly sped;
He rises glorious from the dead:
All glory to our risen Head!
Alleluia !','He brake the age-bound chains of hell;
The bars from heav''ns high portals Fell:
Let hymns of praise His triumph tell:
Alleluia!','Lord, by the stripes which wounded Thee;
From death''s dread sting Thy Servants free,
That we may live, and sing to Thee,
Alleluia!
.']::text[], chorus_en='', description_en='ALLELUIA! ALLELUIA! ALLELUIA!' WHERE source_hymn_number=171;
UPDATE public.hymns SET verses_en=ARRAY['Thy life was given for me,
Thy blood, O Lord, was shed,
That I might ransomed be,
And quickened from the dead;
Thy life was giv''n for me,
What have I giv''n for Thee?','Long years were spent for me;
In weariness and woe,
That through eternity;
Thy glory I might know;
Long years were spent for me,
Have I spent one for Thee?','Thy Father''s home of light,
Thy rainbow-circled throne,
Where left for earthly night,
For wand''rings sad and lone:
Yea, all was left for me;
Have I left for aught for Thee?','Thou, Lord , hast borne for me;
More than my tongue can tell,
Of bitt''rest agony,
To rescue me from hell;
Thou suffer''dst all for me;
What have I borne for Thee?','And Thou hast brought to me;
Down from Thy home above,
Salvation full and free,
Thy pardon and Thy home above;
Great gifts Thou broughtest me;
What have I brought to Thee?','O let my life be giv''n,
My years for Thee be spent,
World-fetters all be giv''n;
And joy with suffering blunt:
Thou gav''st thyself for me;
I give myself to Thee.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=173;
UPDATE public.hymns SET verses_en=ARRAY['Christ the Lord is risen today;
Hallelujah!
Sons of men, and, angels, say,
Hallelujah!
Raise your joys and triumphs high; Hallelujah!
Sing, ye heav''ns; thou earth, reply, Hallelujah','Love''s redeeming work is done;
Hallelujah!
Fought the fight, the battle won;
Hallelujah!
Lo! Our sun''s eclipse is o''er, Hallelujah!
Lo! He sets in blood no more, Hallelujah!','Vain the stone, the watch, the seal;
Hallelujah!
Christ hath burst the gates of hell;
Hallelujah!
Death in vain forbids His rise! Hallelujah!
Christ hath open''d paradise, Hallelujah!','Lives again our glorious King;
Hallelujah!
Where, O death, is now thy sting?
Hallelujah!
Once He died our souls to save, Hallelujah!
Where thy victory, O grave? Hallelujah!','Soar we now where Christ hath led,
Hallelujah!
Following our exalted Head:
Hallelujah!
Made like Him, like Him we rise, Hallelujah!
Ours the cross, the grave the skies, Hallelujah!','Hail the Lord of earth and heaven,
Hallelujah!
Praise to Thee by both be given;
Hallelujah!
Thee we greet triumphant now, Hallelujah!
Hail the Resurrection Thou! Hallelujah!']::text[], chorus_en='', description_en='' WHERE source_hymn_number=174;
UPDATE public.hymns SET verses_en=ARRAY['Master, speak! Thy servant heareth,
Waiting for Thy gracious word;
Longing for Thy voice that cheereth;
Master! Let it now be heard.
I am list''ning, Lord, for thee;
What hast Thou to say to me?','Speak to me by name, O Master,
Let me know it is to me;
Speak, that I may follow faster,
With a step more firm and free,
Where the shepherd leads the flock,
In the shadow of the Rock.','Master, speak! Though least and lowest,
Let me not unheard depart;
Master, speak! For o Thou knowest;
All the yearning of my heart,
Knowest all its truest need;
Speak! And make me blest indeed.','Master, speak! And make me ready,
When Thy voice is truly heard,
With obedience glad and steady
Still to follow every word.
I am listening, Lord for thee;
Master, speak! O speak to me!']::text[], chorus_en='', description_en='' WHERE source_hymn_number=175;
UPDATE public.hymns SET verses_en=ARRAY['Just as God who reigns on high;
Spake to men in days gone by,
So the Lord is calling men today,
And my brother this is true,
Whatso-e''er He says to you;
There is but one thing to do, just obey.','If you''re in the Saviour''s hand,
You must do as He commands,
For there is no other gospel way;
Never put the message by,
Never stop to reason why,
When the Saviour speaks to you, just obey.','If for mansions fair you sigh,
In that land beyond the sky,
After time with you has pass''d away;
Tho'' the way you may not see,
Christ is calling Follow Me;
Faith and duty both will cry just obey.']::text[], chorus_en='Just obey, just obey,
Is the way, God''s way;
When His message comes to you;
There is but one thing to do,
Just obey just obey.
Just obey, just obey,
Is the way, God''s way;
When His message comes to you;
There is but one thing to do,
Just obey just obey.
Just obey, just obey,
Is the way, God''s way;
When His message comes to you;
There is but one thing to do,
Just obey just obey.', description_en='' WHERE source_hymn_number=176;
UPDATE public.hymns SET verses_en=ARRAY['Lord, Thy word abideth,
And, our footsteps guideth;
Who its truth believeth;
Light and joy receiveth.','When our foes are near us,
Then Thy word doth cheer us,
Word of consolation;
Message of salvation.','When the storms are o''er us,
And dark clouds before us,
Then its light directeth;
And our way protecteth.','Who can tell the pleasure,
Who recount the treasure,
By Thy word imparted;
To the simple-hearted?','Word of mercy, giving,
Succour to the living;
Word of life, supplying,
Comfort to the dying!','O that we, discerning;
Its most holy learning,
Lord, may love and fear Thee,
Evermore be near Thee!']::text[], chorus_en='', description_en='' WHERE source_hymn_number=178;
UPDATE public.hymns SET verses_en=ARRAY['Cling to the Bible, tho'' all else be taken;
Lose not its precepts so precious and pure;
Souls that are sleeping its tidings awaken;
Life from the dead in its promises sure.','Cling to the Bible! This jewel and treasure,
Brings life eternal, and saves fallen man;
Surely its value no mortal can measure;
Seek for its blessing, O soul, while you can!','Lamp for the feet that in byways have wander''d;
Guide for the youth that would other wise fall;
Hope for the sinner whose life has been squander''d,
Staff for the aged, and best book of all.']::text[], chorus_en='Cling to the Bible!
Cling to the Bible!
Cling to the Bible;
Our Lamp and our Guide.
Cling to the Bible!
Cling to the Bible!
Cling to the Bible;
Our Lamp and our Guide.
Cling to the Bible!
Cling to the Bible!
Cling to the Bible;
Our Lamp and our Guide.', description_en='' WHERE source_hymn_number=179;
UPDATE public.hymns SET verses_en=ARRAY['There shall be showers of blessing,
This is the promise of love;
There shall be seasons refreshing,
Sent from the Saviour above.','There shall be showers of blessing:
Precious reviving again;
Over the hills and the valleys,
Sound of abundance of rain.','There shall be showers of blessinig,
Sent them upon us, O Lord!
Grant to us now a refreshing;
Come, and now honour Thy word.','There shall be showers of blessing:
Oh that today they might fall,
Now as to God we''re confessing,
Now as on Jesus we call.']::text[], chorus_en='Showers of blessing;
Showers of blessing we need;
Mercy drops round us are falling,
But for the showers we plead.
Showers of blessing;
Showers of blessing we need;
Mercy drops round us are falling,
But for the showers we plead.
Showers of blessing;
Showers of blessing we need;
Mercy drops round us are falling,
But for the showers we plead.
Showers of blessing;
Showers of blessing we need;
Mercy drops round us are falling,
But for the showers we plead.', description_en='' WHERE source_hymn_number=180;
UPDATE public.hymns SET verses_en=ARRAY['When we walk with the lord,
In the light of his word;
What a glory He sheds on our way!
While we do His good will,
He abides with us still,
And with all who will trust and obey.','Not a shadow can rise,
Not a cloud in the skies,
But His smile quickly drives it away;
Not a doubt nor a fear;
Not a sigh nor a tear,
Can abide while we trust and obey.','Not a burden we bear,
Not a sorrow we share;
But our toil he doth richly repay;
Not a grief nor a loss,
Not a frown nor a cross,
But is blest if we trust and obey.','But we never can prove,
The delights of His love;
Until all on the alter we lay;
For the favour He shows,
And the joy he bestows,
Are for them who will trust and obey.','Then in fellowship sweet,
We will sit at His feet,
Or we''ll walk by His side in the way;
What He says we will do;
Where He sends we will go;
Never fear, only trust and obey.']::text[], chorus_en='Trust and obey, for there''s no other way;
To be happy in Jesus,
But to trust and obey.
Trust and obey, for there''s no other way;
To be happy in Jesus,
But to trust and obey.
Trust and obey, for there''s no other way;
To be happy in Jesus,
But to trust and obey.
Trust and obey, for there''s no other way;
To be happy in Jesus,
But to trust and obey.
Trust and obey, for there''s no other way;
To be happy in Jesus,
But to trust and obey.', description_en='' WHERE source_hymn_number=184;
UPDATE public.hymns SET verses_en=ARRAY['Jesus, my Lord, my God, my All;
Hear me, blest Saviour, when I call;
Hear me, and from Thy dwelling place,
Pour down the riches of Thy grace.','Jesus, too late I Thee have sought,
How can I love Thee as I ought?
And how extol Thy matchless fame,
The glorious beauty of Thy name?','Jesus, what didst Thou find in me,
That Thou hast dealt so lovingly?
How great the joy that Thou hast brought;
So far exceeding hope or thought!','Jesus, of Thee shall be my song,
To Thee my heart and soul belong;
All that I have or am is Thine,
And Thou, blest Saviour, Thou art mine.']::text[], chorus_en='Jesus, my Lord, I Thee adore,
Oh make me love Thee more and more.
Jesus, my Lord, I Thee adore,
Oh make me love Thee more and more.
Jesus, my Lord, I Thee adore,
Oh make me love Thee more and more.
Jesus, my Lord, I Thee adore,
Oh make me love Thee more and more.', description_en='' WHERE source_hymn_number=188;
UPDATE public.hymns SET verses_en=ARRAY['The voice that breathed o''er Eden;
That earliest wedding-day,
The primal marriage blessing,
It hath not passed away.','Still in the pure espousal;
Of Christian man and maid,
The Holy Three are with us,5. Be present, gracious Saviour,
To join their loving hands,
As Thou didst bind two natures;
In Thine eternal bands.','Be present, Holy Spirit,
To bless them as they kneel,
As Thou for Christ the Bridegroom;
The heav''nly spouse dost seal.','O spread Thy pure wings o''er them!
Let no ill pow''r find place,
When onward through life''s journey;
The hallow''d path they trace.','To cast their crowns before Thee,
In perfect sacrifice,
Till to the home of gladness;
With Christ''s own bride they rise.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=190;
UPDATE public.hymns SET verses_en=ARRAY['Jesus, do manifest Thyself,
At this matrimony;
We beseech Thee to come, O Lord,
Reveal Thyself to us.','Pour Thy blessings upon these ones,
Whose hands are joined in one;
Look down in favour of their match;
And bless this their union.','Fill both their bosoms with Thy love;
Give to them contentment,
Give them Thy peace O Lord, we pray;
And supply all their needs.','Through Thy perfect love, make them one;
That they, may by Christ''s love,
Make domestic cares become light,
By helping each other.','Let them be help to each other,
In matters of their faith;
And bless thou them with good children;
Who will stablish their home.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=191;
UPDATE public.hymns SET verses_en=ARRAY['Blest be the tie that binds;
Our hearts in Christian love,
The fellowship of kindred minds,
Is like to that above.','Before our Father''s throne,
We pour our ardent pray''rs;
Our fears, our hopes, our aims are one,
Our comforts and our cares.','We share our mutual woes;
Our mutual burdens bear;
And often for each other flows,
The sympathizing tear.','When we asunder part,
It gives us inward pain;
But we shall still be joined in heart,
And hope to meet again.','This glorious hope revives;
Our courage by the way,
While each in expectation lives,
And longs to see the day.','From sorrow, toil and pain,
And sin we shall be free;
And perfect love and friendship reign,
Through all eternity.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=192;
UPDATE public.hymns SET verses_en=ARRAY['How good and pleasant ''tis to see,
When brethren cordially agree,
And kindly think and speak the same!
A family of faith and love,
Combin''d to seek the things above,
And spread the common Saviour''s fame.','The God of grace, who all invites;
Who in our unity delights,
Vouchsafes our intercourse to bless;
Revives us with refreshing show''rs,
The fullness of his blessing pours,
And keeps our minds in perfect peace.','Jesus, Thou precious cornerstone,
Preserve inseparably one;
Whom Thou didst by Thy Spirit join:
Still let us in Thy Spirit live,
And to Thy church the pattern give,
Of unanimity divine.','Still let us to each other cleave,
And from Thy plenitude receive;
Constant supplies of hallo''ing race;
Till to a perfect man we rise,
O''ertake our kindred in the skies,
And find prepar''d our heav''nly place.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=196;
UPDATE public.hymns SET verses_en=ARRAY['Yet there is room, The Lamb''s bright hall of song,
With its fair glory, beckons thee along;
Room, room, still room! Oh, enter, enter now!','Day is declining, and the sun is low,
The shadows lengthen, light makes haste to go;
Room, room, still room! Oh, enter, enter now!','The bridal hall is filling for the feast;
Pass in! pass in! and be the Bridegroom''s guest:
Room, room! Still room! Oh, enter, enter now!','Yet there is room! Still open stands the gate,
The gate of love, it is not yet too late:
Room, room, still room! Oh, enter, enter now!','Pass in! pass in! That banquet is for thee;
That cup of everlasting love is free,
Room, room, still room, oh, enter, enter now!','All heav''n is there! All joy! Go in go in!
The angels beckon thee the prize to win:
Room, room, still room, oh, enter, enter now!','Louder and sweeter sounds the loving call;
Come, ling''rer, come! enter that festal hall:
Room, room, still room, oh, enter, enter now!','It fills, it fills, that hall of jubilee!
Make haste, make haste! ''tis not too full for thee!
Room, room, still room, oh enter, enter now!','Ere night that gate may close, and seal thy doom,
Then the last, low, long cry, No room, no room!
No room, no room! Oh, woeful cry! No room!']::text[], chorus_en='', description_en='' WHERE source_hymn_number=197;
UPDATE public.hymns SET verses_en=ARRAY['There''s a great day coming,
A great day coming,
There''s a great day coming by and by;
When the saints and the sinners;
Shall be parted right and left.','There''s a bright day coming,
A bright day coming,
There''s a bright day coming by and by;
But its brightness shall only;
Come to them that love the Lord,
Are you ready for the day to come?','There''s a sad day coming,
A sad day coming,
There''s a sad day coming by and by;
When the sinner shall hear his doom,
"Depart, I know ye not",
Are you ready for that day to come?']::text[], chorus_en='Are you ready for that day to come?
Are you ready? Are you ready?
Are you ready for the judgment day?
Are you ready? Are you ready?
For the judgment day?
Are you ready for that day to come?
Are you ready? Are you ready?
Are you ready for the judgment day?
Are you ready? Are you ready?
For the judgment day?
Are you ready for that day to come?
Are you ready? Are you ready?
Are you ready for the judgment day?
Are you ready? Are you ready?
For the judgment day?', description_en='' WHERE source_hymn_number=200;
UPDATE public.hymns SET verses_en=ARRAY['When the pow''r of God descended;
On the day of Pentecost,
All the days of waiting ended,
They received the Holy Ghost.','Tongues of flame came down upon them,
And they preached the word in pow''r,
List''ning multitudes awaken''d;
Turned to God that very hour.','We are waiting Holy Spirit;
We are all of one accord,
Lord fulfil just now the promise;
That is given in Thy Word.','Fill and thrill us with thy presence,
Grant the blessing that we need;
Flood our souls with wondrous glory,
While the pray''r of faith we plead.']::text[], chorus_en='O Lord, send the pow''r just now,
O Lord, send the pow''r just now,
O Lord, send the pow''r just now,
And baptize, every one.
O Lord, send the pow''r just now,
O Lord, send the pow''r just now,
O Lord, send the pow''r just now,
And baptize, every one.
O Lord, send the pow''r just now,
O Lord, send the pow''r just now,
O Lord, send the pow''r just now,
And baptize, every one.
O Lord, send the pow''r just now,
O Lord, send the pow''r just now,
O Lord, send the pow''r just now,
And baptize, every one.', description_en='' WHERE source_hymn_number=202;
UPDATE public.hymns SET verses_en=ARRAY['We come nigh, our heav''nly Father;
We Thy children weak and faint,
Fill us with Thy Holy Spirit;
Grant that we be all renewed;
Come, Thou Holy Spirit do, come,
Speak through us in a new tongue!
For Thy great gift we are pleading;
Thy great gift of Pentecost.','Lord, remember Thou Thy promise;
Pour Thy Spirit on all flesh,
Give us of Thy peace, we pray Thee,
Peace, the world cannot afford,
Come Thou Holy Spirit, do come;
Sin destroy Thou in our hearts,
For Thy great gift we are pleading,
Thy great gift of Pentecost.','Heav''nly Dove, descend upon us;
Fill us with Thy pow''r divine,
That the nations all may worship;
To our Saviour yielded be,
Let us hear of Thy great pow''r through,
This dark continent of ours;
For Thy great gift we are pleading,
Thy great gift of Pentecost.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=206;
UPDATE public.hymns SET verses_en=ARRAY['Whoever receiveth the Crucified One,
Whoever believeth on God''s only son,
A free and a perfect salvation shall have;
For He is abundantly able to save.','Whoever receiveth the message of God,
And trusts in the power of the soul cleansing blood,
A full and eternal redemption shall have;
For He is both able and willing to save.','Whoever repents and forsakes ev''ry sin,
And opens his heart for the Lord to come in,
A present and perfect salvation shall have:
For Jesus is ready this moment to save.']::text[], chorus_en='My brother, the Master is calling for thee;
His grace and His mercy are won drously free!
His blood as a ransom for sinners He gave,
And He is abundantly able to save.
My brother, the Master is calling for thee;
His grace and His mercy are won drously free!
His blood as a ransom for sinners He gave,
And He is abundantly able to save.
My brother, the Master is calling for thee;
His grace and His mercy are won drously free!
His blood as a ransom for sinners He gave,
And He is abundantly able to save.', description_en='' WHERE source_hymn_number=213;
UPDATE public.hymns SET verses_en=ARRAY['I am the way, the Saviour said,
And I would follow on,
Content to know that after night;
Shall break a glorious dawn.','I am the Truth, then Truth shall be;
A beacon light to guide,
My bark across the stormy sea;
To where still waters glide.','I am the Life, there is no death,
For me to fear, nor dead,
Since by His all atoning blood,
My life to His is wed.']::text[], chorus_en='I am the Way, the Truth and the Life,
No man cometh unto the Father but by me,
I am the Way, the Truth and the Life;
No man cometh unto the Father but by me.
I am the Way, the Truth and the Life,
No man cometh unto the Father but by me,
I am the Way, the Truth and the Life;
No man cometh unto the Father but by me.
I am the Way, the Truth and the Life,
No man cometh unto the Father but by me,
I am the Way, the Truth and the Life;
No man cometh unto the Father but by me.', description_en='' WHERE source_hymn_number=214;
UPDATE public.hymns SET verses_en=ARRAY['Are you weary, are you heavy hearted?
Tell it to Jesus, tell it to Jesus;
Are you grieving over joys departed?
Tell it to Jesus alone.','Do the tears flow down your cheeks unbidden?
Tell it to Jesus, tell it to Jesus;
Have you sins that to men''s eyes are hidden?
Tell it to Jesus alone.','Do you fear the gathering clouds of sorrow?
Tell it to Jesus, tell it to Jesus;
Are you anxious what shall be tomorrow?
Tell it to Jesus alone.','Are you troubled at the thought of dying?
Tell it to Jesus, tell it to Jesus;
For Christ''s coming kingdom are you singing?
Tell it to Jesus alone.']::text[], chorus_en='Tell it to Jesus, tell it to Jesus,
He is a friend that''s well known;
You have no other such a friend or brother,
Tell it to Jesus alone.
Tell it to Jesus, tell it to Jesus,
He is a friend that''s well known;
You have no other such a friend or brother,
Tell it to Jesus alone.
Tell it to Jesus, tell it to Jesus,
He is a friend that''s well known;
You have no other such a friend or brother,
Tell it to Jesus alone.
Tell it to Jesus, tell it to Jesus,
He is a friend that''s well known;
You have no other such a friend or brother,
Tell it to Jesus alone.', description_en='' WHERE source_hymn_number=218;
UPDATE public.hymns SET verses_en=ARRAY['The Great Physician now is near,
The sympathizing Jesus;
He speaks the drooping heart to cheer,
Oh, hear the voice of Jesus!','Your many sins are all forgiven,
Oh, hear the voice of Jesus!
Go on your way in peace to heaven,
And wear a crown with Jesus.','All glory to the risen Lamb!
I now believe in Jesus;
I love the blessed Saviour''s name,
I love the name of Jesus.','His name dispels my guilt and fear,
No other name but Jesus;
Oh, how my soul delights to hear,
The precious name of Jesus.','Come, brethren, help me sing His praise,
Oh, praise the name of Jesus!
Come, sisters, all your voices raise!
Oh, bless the name of Jesus.','The children too, both great and small,
Who love the name of Jesus,
May now accept the gracious call;
To work and live for Jesus.','And when to the bright world above;
We rise to see our Jesus,
We''ll sing around the throne of love;
His name, the name of Jesus.']::text[], chorus_en='Sweetest note in seraph song,
Sweetest name on mortal tongue,
Sweetest carol ever sung:
Jesus! blessed Jesus!
Sweetest note in seraph song,
Sweetest name on mortal tongue,
Sweetest carol ever sung:
Jesus! blessed Jesus!
Sweetest note in seraph song,
Sweetest name on mortal tongue,
Sweetest carol ever sung:
Jesus! blessed Jesus!
Sweetest note in seraph song,
Sweetest name on mortal tongue,
Sweetest carol ever sung:
Jesus! blessed Jesus!
Sweetest note in seraph song,
Sweetest name on mortal tongue,
Sweetest carol ever sung:
Jesus! blessed Jesus!
Sweetest note in seraph song,
Sweetest name on mortal tongue,
Sweetest carol ever sung:
Jesus! blessed Jesus!
Sweetest note in seraph song,
Sweetest name on mortal tongue,
Sweetest carol ever sung:
Jesus! blessed Jesus!', description_en='' WHERE source_hymn_number=219;
UPDATE public.hymns SET verses_en=ARRAY['There''s a stranger at the door,
Let Him in;
He has been there oft before,
Let Him in;
Let Him in, ere He is gone,
Let Him in, the Holy One,
Jesus Christ the Father''s son
Let Him in.','Open now to Him your heart;
Let Him in;
If you wait He will depart;
Let Him in;
Let Him in, He is your Friend,
He your soul will sure defend,
He will keep you to the end,
Let Him in.','Hear you now His loving voice?
Let Him in;
Now, oh, now make Him your choice,
Let Him in;
He is standing at your door,
Joy to you He will restore,
And His name you will adore,
Let Him in.','Now admit the heavenly Guest,
Let Him in;
He will make for you a feast,
Let Him in;
He will speak your sins forgiven,
And when earth ties all are riven,
He will take you home to heaven,
Let Him in.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=207;
UPDATE public.hymns SET verses_en=ARRAY['Wonderful story of love;
Tell it to me again,
Wonderful story of love;
Wake the immortal strain,
Angels with rapture announce it;
Shepherd with wonder receive it,
Sinner, O won''t you believe it?
Wonderful story of love.','Wonderful story of love;
Though you are far away,
Wonderful story of love,
Still He doth call today;
Calling from Calvary''s mountain,
Down from the crystal bright fountain;
E''en from the dawn of creation;
Wonderful story of love.','Wonderful story of love,
Jesus provides a rest;
Wonderful story of love,
For all the pure and bless,
Rest in those mansions above us;
With those who''ve gone on before us,
Singing the rapturous chorus;
Wonderful story of love.']::text[], chorus_en='Wonderful! Wonderful!
Wonderful!
Wonderful story of love.
Wonderful! Wonderful!
Wonderful!
Wonderful story of love.
Wonderful! Wonderful!
Wonderful!
Wonderful story of love.', description_en='' WHERE source_hymn_number=216;
UPDATE public.hymns SET verses_en=ARRAY['I am so glad that our Father in heaven;
Tell of His love in the Book He has given;
Wonderful things in the Bible I see;
This is the dearest, that Jesus loves me.','Though I forget Him, and wander away,
Still He doth love me wherever I stray:
Back to His dear loving arms do I flee,
When I remember that Jesus loves me.','Oh, if there''s only one song I can sing;
When in His beauty I see the great King,
This shall my song in eternity be,
Oh, what a wonder that Jesus loves me!','Jesus loves me, and I know I love Him;
Love brought Him down my poor soul to redeem;
Yes, it was love made Him die on the tree;
Oh, I am certain that Jesus loves me!','If one should ask of me, how can I tell?
Glory to Jesus, I know very well!
God''s Holy Spirit with mine doth agree.
Constantly witnessing - Jesus loves me.','In this assurance I find sweetest rest,
Trusting in Jesus, I know I am blest,
Satan, dismayed, from my soul now doth flee,
When I just tell him that Jesus loves me.']::text[], chorus_en='I am so glad that Jesus loves me;
Jesus loves me, Jesus loves me,
I am so glad that Jesus loves me,
Jesus loves even me.
I am so glad that Jesus loves me;
Jesus loves me, Jesus loves me,
I am so glad that Jesus loves me,
Jesus loves even me.
I am so glad that Jesus loves me;
Jesus loves me, Jesus loves me,
I am so glad that Jesus loves me,
Jesus loves even me.
I am so glad that Jesus loves me;
Jesus loves me, Jesus loves me,
I am so glad that Jesus loves me,
Jesus loves even me.
I am so glad that Jesus loves me;
Jesus loves me, Jesus loves me,
I am so glad that Jesus loves me,
Jesus loves even me.
I am so glad that Jesus loves me;
Jesus loves me, Jesus loves me,
I am so glad that Jesus loves me,
Jesus loves even me.', description_en='' WHERE source_hymn_number=221;
UPDATE public.hymns SET verses_en=ARRAY['Jesus loves me, this I know,
For the Bible tells me so;
Little ones to Him belong,
They are weak, but He is strong.','Jesus loves me, He Who died,
Heaven''s gate to open wide;
He will wash away my sin,
Let His little child come in.','Jesus loves me, loves me still,
Though I''m very weak and ill;
From His shining throne on high,
He will watch me where I lie.','Jesus loves me, He will stay;
Close beside me all the way,
Then His little child will take,
Up to Heav''n, for His dear sake.']::text[], chorus_en='Yes, Je-sus loves me!
Yes, Je-sus loves me!
Yes, Je-sus loves me!
The Bi-ble tells me so!
Yes, Je-sus loves me!
Yes, Je-sus loves me!
Yes, Je-sus loves me!
The Bi-ble tells me so!
Yes, Je-sus loves me!
Yes, Je-sus loves me!
Yes, Je-sus loves me!
The Bi-ble tells me so!
Yes, Je-sus loves me!
Yes, Je-sus loves me!
Yes, Je-sus loves me!
The Bi-ble tells me so!', description_en='' WHERE source_hymn_number=223;
UPDATE public.hymns SET verses_en=ARRAY['I want to be like Jesus,
So lowly and so meek,
For no one marked an angry word;
That ever heard Him speak.','I want to be like Jesus,
So frequently in prayer;
Alone upon the mountain-top,
He met His Father there.','I want to be like Jesus,
I never, never find;
That He, though persecuted, was,
To any one unkind.','I want to be like Jesus,
Engaged in doing good,
So that of me it may be said,
She hath done what she could.','I want to be like Jesus,
Who sweetly said to all,
"Let little children come to Me."
I would obey the call.','But oh, I''m not like Jesus,
As any one may see;
Then, gentle Saviour, send Thy Grace,']::text[], chorus_en='', description_en='' WHERE source_hymn_number=224;
UPDATE public.hymns SET verses_en=ARRAY['When little Samuel woke;
And heard his master''s voice,
At ev''ry word he spoke,
How much did he rejoice,
Oh, blessed happy child to find;
The God of heav''n so near and kind.','If God would speak to me;
And say He is my Friend,
How happy I should be,
Oh how would I attend;
The smallest sin I then should fear,
If God Almighty were so near.','And does He never speak?
Oh, yes, for in His word;
He bids me come and seek,
The God that Samuel heard,
In almost ev''ry page I see;
The God of Samuel calls to me.','And I beneath His care,
May safely rest my head;
I know that God is there,
To guard my humble bed;
And every sin I well may fear,
Since God Almighty is so-near.','Like Samuel let me say,
When''er I read Thy word;
Speak, Lord, I would obey,
The voice that I have heard,
And when I in Thy house appear;
Speak for Thy servant waits to hear.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=226;
UPDATE public.hymns SET verses_en=ARRAY['Jerusalem on high;
My song and city is,
My home whene''er I die,
The center of my bliss.','There dwells my Lord, my King,
Judged here until to live;
There angels to Him sing,
And lowly homage give.','The patriarchs of old,
There from their travels cease;
The prophets there behold;
Their long''d-for Prince of peace.','The Lamb''s apostles there,
I might with joy behold;
The harpers I might hear;
Harping on harps of gold.','The bleeding martyrs, they,
Within those courts are found;
All cloth''d in pure array;
Their scars with glory crown''d.','Ah me! ah! me! That I,
In Kedar''s tents here stay:
No place like this on high;
Thither, Lord, guide my way.']::text[], chorus_en='O happy place! When shall I be,
My God, with Thee, to see Thy face!
O happy place! When shall I be,
My God, with Thee, to see Thy face!
O happy place! When shall I be,
My God, with Thee, to see Thy face!
O happy place! When shall I be,
My God, with Thee, to see Thy face!
O happy place! When shall I be,
My God, with Thee, to see Thy face!
O happy place! When shall I be,
My God, with Thee, to see Thy face!', description_en='' WHERE source_hymn_number=230;
UPDATE public.hymns SET verses_en=ARRAY['We speak of the realms of the Blest,
Of that country so bright and so fair;
And oft are its glories confess''d;
But what must it be to be to be there?','We speak of its pathways of gold,
Of its walls deek''d with Jewels most rare;
Its wonders and pleasures untold,
But what must it be to be there?','We speak of its freedom from sin,
From sorrow, temptation, and care,
From trials without and within?
But what must it be to be there?','We speak of its anthems of praise,
With which we can never compare,
The sweetest on earth we can raise;
But what must it be to be there?','We speak of its service of love,
Of the robes which the glorified wear,
The Church of the First-born above;
But what must it be to be there?','Do Thou, Lord, ''midst pleasure of woe,
Still for Heav''n our spirits prepare,
And shortly we also shall know;
And feel what it is to be there.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=231;
UPDATE public.hymns SET verses_en=ARRAY['When ends earth''s long and evil day;
This world of mis''ry and of woes,
There is a place so bright;
No change or decay there to find,
No night, but all eternal day;
Tell me, will you be there?','Its pearly gates are clos''d to sin;
No unclean thing shall enter in,
To spoil the place so bright,
That happy, shining golden shore,
No curse will ever there be found,
Tell me, will you be there?','Who will be there the lowly heart?
Who served the Lord in godly fear;
Who count the world but loss,
Those led by the Holy Spirit;
Those who walk in the narrow way,
They are those to be there.']::text[], chorus_en='', description_en='' WHERE source_hymn_number=232;
UPDATE public.hymns SET verses_en=ARRAY['There is singing in heav''n such as we have never known,
Where the angels sing the praises of the lamb upon the throne,
Their sweet harps are ever tuneful and their voices always clear,
O that we might be more like them while we serve the Master here!','But I hear another anthem blending voices clear and strong,
Unto Him that hath redeem''d us and hath bought us, is the song;
We have come thro'' tribulations to this land so fair and bright,
In the fountain, freely flowing He hath made our garments white.','Then the angels stand and listen, for they cannot join that song,
Like the sound of many waters by that happy, blood-wash''d throng;
For they sing about great trials, battles fought and vict''ries won,
And they praise their great redeemer who hath said to them, well done!.','So, although I''m not an angel, yet I know that over there,
I will join a blessed chorus that the angel cannot share;
I will sing about my Saviour who upon dark Calvary;
Freely pardon''d my transgressions died to set a sinner free.']::text[], chorus_en='Holy, holy, is what the angels sing,
And I expect to help them make the courts of heav''n ring;
But when I sing redemption''s story they will fold their wings;
For angels never felt the joys that our salvation brings.
Holy, holy, is what the angels sing,
And I expect to help them make the courts of heav''n ring;
But when I sing redemption''s story they will fold their wings;
For angels never felt the joys that our salvation brings.
Holy, holy, is what the angels sing,
And I expect to help them make the courts of heav''n ring;
But when I sing redemption''s story they will fold their wings;
For angels never felt the joys that our salvation brings.
Holy, holy, is what the angels sing,
And I expect to help them make the courts of heav''n ring;
But when I sing redemption''s story they will fold their wings;
For angels never felt the joys that our salvation brings…', description_en='' WHERE source_hymn_number=233;
UPDATE public.hymns SET verses_en=ARRAY['In the land of fadeless day;
Lies the city four-square,
It shall never pass away,
And there is no night there.','All the gates of pearl are made;
In that city four-square,
All the streets with gold are laid,
And there is no night there.','And the gates shall never close
To the city four-square,
There life''s crystal river flows,
And there is no night there.','There they need no sunshine bright,
In that city four-square,
For the lamb is all the light,
And there is no night there.']::text[], chorus_en='God shall wipe away all tears,
There''s no death, no pain, nor fears;
And they count not time by years,
For there is no night there.
God shall wipe away all tears,
There''s no death, no pain, nor fears;
And they count not time by years,
For there is no night there.
God shall wipe away all tears,
There''s no death, no pain, nor fears;
And they count not time by years,
For there is no night there.
God shall wipe away all tears,
There''s no death, no pain, nor fears;
And they count not time by years,
For there is no night there.', description_en='' WHERE source_hymn_number=235;
UPDATE public.hymns SET verses_en=ARRAY['I must needs go home by the way of the cross;
There''s no other way but this;
I shall ne''er get sight of Gate of light,
If the way of the cross I miss.','I must needs go on in the blood sprinkle way,
The path that the Saviour trod,
If I ever climb to the heights sublime,
Where the soul is at home with God.','Then I bid farewell to the way of the world.
To walk in it never more;
For my Lord says come, and I seek my home,
Where He wait at the open door.']::text[], chorus_en='The way of the cross leads home,
The way of the cross leads home;
It is sweet to know, as I onward go,
The way of the cross leads home.
The way of the cross leads home,
The way of the cross leads home;
It is sweet to know, as I onward go,
The way of the cross leads home.
The way of the cross leads home,
The way of the cross leads home;
It is sweet to know, as I onward go,
The way of the cross leads home.', description_en='' WHERE source_hymn_number=237;
UPDATE public.hymns SET verses_en=ARRAY['Will your anchor hold in the storms of life?
When the clouds unfold their wings of strife;
When the strong tides lift and the cables strain,
Will your anchor drift or firm remain?','It is safely moored, t''will the storm withstand;
For ''tis well secured by the Saviour''s hand,
And the cables passed from His heart to mine,
Can defy the blast, through strength divine.','It will firmly hold in the straits of fear,
When the breakers have told the reef is near,
Though the tempest rave and the wild winds blow;
Not an angry wave shall our bark o''erflow.','It will surely hold in the floods of death,
When the waters cold, chill our latest breath;
On the rising tide it can never fail,
While our hopes abide within the veil!','When our eyes behold, through the gathering night;
The city of gold, our habour bright,
We shall anchor fast by the heavenly shore,
With the storms all past for ever more.']::text[], chorus_en='We have an anchor that keeps the soul;
Steadfast and sure while the billows roll:
Fasten''d to the Rock which cannot move,
Grounded firm and deep in the Saviour''s love.
We have an anchor that keeps the soul;
Steadfast and sure while the billows roll:
Fasten''d to the Rock which cannot move,
Grounded firm and deep in the Saviour''s love.
We have an anchor that keeps the soul;
Steadfast and sure while the billows roll:
Fasten''d to the Rock which cannot move,
Grounded firm and deep in the Saviour''s love.
We have an anchor that keeps the soul;
Steadfast and sure while the billows roll:
Fasten''d to the Rock which cannot move,
Grounded firm and deep in the Saviour''s love.
We have an anchor that keeps the soul;
Steadfast and sure while the billows roll:
Fasten''d to the Rock which cannot move,
Grounded firm and deep in the Saviour''s love.', description_en='' WHERE source_hymn_number=246;

UPDATE public.hymns SET verses_en=ARRAY['Blessed assurance, Jesus is mine!
Oh, what a foretaste of glory divine!
Heir of salvation, purchased of God,
Born of His Spirit, washed in His blood.','Perfect submission, perfect delight,
Visions of rapture now burst on my sight.
Angels descending, bring from above
Echoes of mercy, whispers of love.','Perfect submission, all is at rest,
I in my Saviour am happy and blest,
Watching and waiting, looking above,
Filled with His goodness, lost in His love.']::text[], chorus_en='This is my story, this is my song,
Praising my Saviour all the day long;
This is my story, this is my song,
Praising my Saviour all the day long.' WHERE source_hymn_number=4;
UPDATE public.hymns SET verses_en=ARRAY['Rock of Ages, cleft for me,
Let me hide myself in Thee;
Let the water and the blood,
From Thy wounded side which flowed,
Be of sin the double cure;
Save from wrath and make me pure.','Not the labor of my hands
Can fulfill Thy law''s demands;
Could my zeal no respite know,
Could my tears forever flow,
All for sin could not atone;
Thou must save, and Thou alone.','Nothing in my hand I bring,
Simply to the cross I cling;
Naked, come to Thee for dress;
Helpless look to Thee for grace;
Foul, I to the fountain fly;
Wash me, Savior, or I die.','While I draw this fleeting breath,
When mine eyes shall close in death,
When I soar to worlds unknown,
See Thee on Thy judgment throne;
Rock of Ages, cleft for me,
Let me hide myself in Thee.']::text[], chorus_en='' WHERE source_hymn_number=64;
UPDATE public.hymns SET verses_en=ARRAY['Nearer, my God, to Thee, nearer to Thee!
E''en tho'' it be a cross that raiseth me,
Still all my song shall be, nearer, my God, to Thee,
Nearer, my God, to Thee, nearer to Thee!','Tho'' like the wanderer, the sun gone down,
Darkness be over me, my rest a stone,
Yet in my dreams I''d be nearer, my God, to Thee,
Nearer, my God, to Thee, nearer to Thee!','There let the way appear, steps unto heav''n;
All that Thou sendest me, in mercy giv''n;
Angels to beckon me nearer, my God, to Thee,
Nearer, my God, to Thee, nearer to Thee!','Or if, on joyful wing cleaving the sky,
Sun, moon, and stars forget, upward I fly,
Still all my song shall be, nearer, my God, to Thee,
Nearer, my God, to Thee, nearer to Thee!']::text[], chorus_en='' WHERE source_hymn_number=85;
UPDATE public.hymns SET verses_en=ARRAY['O happy day, that fixed my choice on Thee, my Saviour and my God!
Well may this glowing heart rejoice, and tell its raptures all abroad.','''Tis done, the great transaction''s done! I am my Lord''s, and He is mine.
He drew me, and I followed on, charmed to confess the voice divine.','Now rest, my long divided heart; fixed on this blissful centre, rest.
Here have I found a nobler part; here heavenly pleasures fill my breast.','High heaven that heard the solemn vow, that vow renewed shall daily hear,
Till in life''s latest hour I bow, and bless in death a bond so dear.']::text[], chorus_en='Happy day, happy day, when Jesus washed my sins away!
He taught me how to watch and pray, and live rejoicing every day;
Happy day, happy day, when Jesus washed my sins away.' WHERE source_hymn_number=66;
UPDATE public.hymns SET verses_en=ARRAY['Christ Jesus hath the pow''r, The power to forgive, The pow''r to quicken whom He will, And make the sinner live.
Christ Jesus hath the pow''r, O tell it far and near! O bring to Him your guilty heart, And grace shall banish fear!','Christ Jesus hath the pow''r, The power to renew, The pow''r to cleanse your heart from sin, And make you wholly true.
Christ Jesus hath the pow''r For evermore to keep; O none can pluck you from His hand, Or rob Him of His sheep!','Christ Jesus hath the pow''r, The power to console, The pow''r to carry all your care, On Him your burdens roll.
Christ Jesus hath the pow''r, To wipe the tear away; O place in Him your confidence! O trust Him, and obey!','Christ Jesus hath the pow''r, The power to destroy, The pow''r to bruise your enemy Who would your soul annoy.
Christ Jesus hath the pow''r, When on your dying bed, To give your soul the victory, The pow''r to raise the dead!']::text[], chorus_en='Christ Jesus hath the pow''r, The pow''r of God He wields! Christ Jesus hath the pow''r, My heart surrender yields! Christ Jesus hath the pow''r, I trust Him evermore! Christ Jesus hath the pow''r, I worship and adore!' WHERE source_hymn_number=67;
UPDATE public.hymns SET verses_en=ARRAY['My soul is so happy in Jesus, For He is so precious to me; His voice it is music to hear it, His face it is heaven to see.','He sought me so long ere I knew Him, When wand''ring afar from the fold; Safe home in His arms He hath bro''t me, To where there are pleasures untold.','His love and His mercy surround me, His grace like a river doth flow; His Spirit, to guide and to comfort, Is with me wherever I go.','They say I shall some day be like Him, My cross and my burden lay down; Till then I will ever be faithful, In gathering gems for His crown.']::text[], chorus_en='I am happy in Him, I am happy in Him; My soul with delight He fills day and night. For I am happy in Him.' WHERE source_hymn_number=68;
UPDATE public.hymns SET verses_en=ARRAY['Years I spent in vanity and pride, caring not my Lord was crucified, knowing not it was for me He died on Calvary.','By God''s Word at last my sin I learned; then I trembled at the law I''d spurned, till my guilty soul imploring turned to Calvary.','Now I''ve giv''n to Jesus ev''rything; now I gladly own Him as my King; now my raptured soul can only sing of Calvary.','O the love that drew salvation''s plan! O the grace that brought it down to man! O the mighty gulf that God did span at Calvary!']::text[], chorus_en='Mercy there was great and grace was free; pardon there was multiplied to me; there my burdened soul found liberty, at Calvary.' WHERE source_hymn_number=62;
UPDATE public.hymns SET verses_en=ARRAY['O for a thousand tongues to sing my great Redeemer''s praise, the glories of my God and King, the triumphs of his grace!','My gracious Master and my God, assist me to proclaim, to spread through all the earth abroad the honors of thy name.','Jesus! the name that charms our fears, that bids our sorrows cease; ''tis music in the sinner''s ears, ''tis life, and health, and peace.','He breaks the power of canceled sin, he sets the prisoner free; his blood can make the foulest clean; his blood availed for me.','He speaks, and listening to his voice, new life the dead receive; the mournful, broken hearts rejoice, the humble poor believe.','Hear him, ye deaf; his praise, ye dumb, your loosened tongues employ; ye blind, behold your Savior come, and leap, ye lame, for joy.','In Christ, your head, you then shall know, shall feel your sins forgiven; anticipate your heaven below, and own that love is heaven.']::text[], chorus_en='' WHERE source_hymn_number=15;
UPDATE public.hymns SET verses_en=ARRAY['O worship the King all-glorious above, O gratefully sing his pow''r and his love; our shield and Defender, the Ancient of Days, pavilioned in splendor and girded with praise.','O tell of his might, O sing of his grace, whose robe is the light, whose canopy space. His chariots of wrath the deep thunderclouds form, and dark is his path on the wings of the storm.','The earth with its store of wonders untold, Almighty, your pow''r has founded of old; has ''stablished it fast by a changeless decree, and round it has cast, like a mantle, the sea.','Your bountiful care what tongue can recite? It breathes in the air; it shines in the light; it streams from the hills; it descends to the plain; and sweetly distils in the dew and the rain.','Frail children of dust, and feeble as frail, in you do we trust, nor find you to fail; your mercies how tender, how firm to the end, our Maker, Defender, Redeemer, and Friend!','O measureless Might! Ineffable Love! While angels delight to hymn you above, the humbler creation, though feeble their lays, with true adoration shall lisp to your praise.']::text[], chorus_en='' WHERE source_hymn_number=16;
UPDATE public.hymns SET verses_en=ARRAY['Praise Him! praise Him! Jesus, our blessed Redeemer! Sing, O earth, His wonderful love proclaim! Hail Him! hail Him! highest archangels in glory; Strength and honor give to His holy Name! Like a shepherd, Jesus will guard His children, In His arms He carries them all day long.','Praise Him! praise Him! Jesus, our blessed Redeemer! For our sins He suffered, and bled, and died; He our Rock, our hope of eternal salvation, Hail Him! hail Him! Jesus the Crucified. Sound His praises! Jesus who bore our sorrows, Love unbounded, wonderful, deep and strong.','Praise Him! praise Him! Jesus, our blessed Redeemer! Heav''nly portals loud with hosannas ring! Jesus, Saviour, reigneth for ever and ever; Crown Him! crown Him! Prophet, and Priest, and King! Christ is coming! Over the world victorious, Pow''r and glory unto the Lord belong.']::text[], chorus_en='Praise Him! praise Him! Tell of His excellent greatness. Praise Him! praise Him! ever in joyful song!' WHERE source_hymn_number=17;
UPDATE public.hymns SET verses_en=ARRAY['Once again the Gospel message From the Saviour you have heard; Will you heed the invitation? Will you turn and seek the Lord?','Many summers you have wasted, Ripened harvests you have seen; Winter snows by spring have melted, Yet you linger in your sin.','Jesus for your choice is waiting; Tarry not: at once decide! While the Spirit now is striving, Yield, and seek the Saviour''s side.','Cease of fitness to be thinking; Do not longer try to feel; It is trusting, and not feeling, That will give the Spirit''s seal.','Let your will to God be given, Trust in Christ''s atoning blood; Look to Jesus now in heaven, Rest on His unchanging word.']::text[], chorus_en='Come believing! come believing! Come to Jesus! look and live! Come believing! come believing! Come to Jesus! look and live!' WHERE source_hymn_number=59;
UPDATE public.hymns SET verses_en=ARRAY['Deeper, deeper in the love of Jesus daily let me go; higher, higher in the school of wisdom, more of grace to know.','Deeper, deeper! Blessed Holy Spirit, take me deeper still, till my life is wholly lost in Jesus, and His perfect will.','Deeper, deeper! Though it cost hard trials, deeper let me go! Rooted in the holy love of Jesus, let me fruitful grow.','Deeper, higher, ev''ry day in Jesus, till all conflict past finds me conqu''ror, and in His own image perfected at last.']::text[], chorus_en='O deeper yet, I pray, and higher ev''ry day, and wiser, blessed Lord, in Thy precious, holy Word.' WHERE source_hymn_number=92;
UPDATE public.hymns SET verses_en=ARRAY['Safe in the arms of Jesus, safe on His gentle breast, there by His love o''ershaded, sweetly my soul shall rest. Hark! ''tis the voice of angels, borne in a song to me, over the fields of glory, over the jasper sea.','Safe in the arms of Jesus, safe from corroding care, safe from the world''s temptations, sin cannot harm me there. Free from the blight of sorrow, free from my doubts and fears; only a few more trials, only a few more tears!','Jesus, my heart''s dear refuge, Jesus has died for me; firm on the Rock of Ages, ever my trust shall be. Here let me wait in patience, wait till the night is o''er; wait till I see the morning break on the golden shore.']::text[], chorus_en='Safe in the arms of Jesus, safe on His gentle breast, there by His love o''ershaded, sweetly my soul shall rest.' WHERE source_hymn_number=136;
UPDATE public.hymns SET verses_en=ARRAY['Standing on the promises of Christ my King! Through eternal ages let His praises ring. "Glory in the highest!" I will shout and sing, standing on the promises of God.','Standing on the promises that cannot fail! When the howling storms of doubt and fear assail, by the living Word of God I shall prevail, standing on the promises of God.','Standing on the promises I now can see perfect, present cleansing in the blood for me; standing in the liberty where Christ makes free, standing on the promises of God.','Standing on the promises of Christ the Lord, bound to Him eternally by love''s strong cord, overcoming daily with the Spirit''s sword, standing on the promises of God.','Standing on the promises I cannot fall, listening every moment to the Spirit''s call, resting in my Savior as my all in all, standing on the promises of God.']::text[], chorus_en='Standing, standing, standing on the promises of God, my Savior; standing, standing, I''m standing on the promises of God.' WHERE source_hymn_number=140;
UPDATE public.hymns SET verses_en=ARRAY['I need Thee ev''ry hour, most gracious Lord; no tender voice like Thine can peace afford.','I need Thee ev''ry hour, stay Thou nearby; temptations lose their pow''r when Thou art nigh.','I need Thee ev''ry hour, in joy or pain; come quickly and abide, or life is vain.','I need Thee ev''ry hour, teach me Thy will; and Thy rich promises in me fulfill.','I need Thee ev''ry hour, most Holy One; O make me Thine indeed, Thou blessed Son.']::text[], chorus_en='I need Thee, O I need Thee; ev''ry hour I need Thee; O bless me now, my Savior, I come to Thee.' WHERE source_hymn_number=149;
UPDATE public.hymns SET verses_en=ARRAY['I must tell Jesus all of my trials; I cannot bear these burdens alone; In my distress He kindly will help me; He ever loves and cares for His own.','I must tell Jesus all of my troubles; He is a kind, compassionate friend; If I but ask Him, He will deliver, Make of my troubles quickly an end.','Tempted and tried, I need a great Savior, One who can help my burdens to bear; I must tell Jesus, I must tell Jesus; He all my cares and sorrows will share.','O how the world to evil allures me! O how my heart is tempted to sin! I must tell Jesus, and He will help me Over the world the vict''ry to win.']::text[], chorus_en='I must tell Jesus! I must tell Jesus! I cannot bear my burdens alone; I must tell Jesus! I must tell Jesus! Jesus can help me, Jesus alone.' WHERE source_hymn_number=151;
UPDATE public.hymns SET verses_en=ARRAY['There''s a land that is fairer than day, And by faith we can see it afar; For the Father waits over the way To prepare us a dwelling place there.','We shall sing on that beautiful shore The melodious songs of the blessed; And our spirits shall sorrow no more, Not a sigh for the blessing of rest.','To our bountiful Father above, We will offer our tribute of praise For the glorious gift of His love And the blessings that hallow our days.']::text[], chorus_en='In the sweet by and by, We shall meet on that beautiful shore; In the sweet by and by, We shall meet on that beautiful shore.' WHERE source_hymn_number=240;
UPDATE public.hymns SET verses_en=ARRAY['O to be like Thee! Blessed Redeemer, this is my constant longing and prayer; gladly I''ll forfeit all of earth''s treasures, Jesus Thy perfect likeness to wear.','O to be like Thee! Full of compassion, loving, forgiving, tender, and kind; helping the helpless, cheering the fainting, seeking the wand''ring sinner to find.','O to be like Thee! Lowly in spirit, holy and harmless, patient, and brave; meekly enduring cruel reproaches, willing to suffer, others to save.','O to be like Thee! Lord, I am coming now to receive th''anointing divine; all that I am and have I am bringing, Lord, from this moment all shall be Thine.','O to be like Thee! While I am pleading, pour out Thy Spirit, fill with Thy love; make me a temple meet for Thy dwelling, fit me for life and heaven above.']::text[], chorus_en='Oh! to be like Thee! O to be like Thee,
Blessed Redeemer, pure as Thou art;
Come in Thy sweetness, come in Thy fullness;
Stamp Thine own image deep on my heart.' WHERE source_hymn_number=93;
UPDATE public.hymns SET verses_en=ARRAY['Once more, my soul, thy Saviour, through the Word, Is offered full and free; And now, O Lord, I must, I must decide: Shall I accept of Thee?','By grace I will Thy mercy now receive, Thy love my heart hath won: On Thee, O Christ, I will, I will believe, And trust in Thee alone!','Thou knowest, Lord, how very weak I am, And how I fear to stray; For strength to serve I look to Thee alone, The strength Thou must supply.','And now, O Lord, give all with us to-day The grace to join our song; And from the heart to gladly with us say: "I WILL to Christ belong!"','To all who came, when Thou wast here below And said, "O Lord, wilt Thou?" To them, "I will!" was ever Thy reply: We rest upon it now.']::text[], chorus_en='I will! I will! I will!
God helping me, I will, O Lord, be Thine!
Thy precious blood was shed to purchase me,
I will be wholly Thine!' WHERE source_hymn_number=97;
UPDATE public.hymns SET verses_en=ARRAY['I dreamed that the great judgment morning Had dawned, and the trumpet had blown; I dreamed that the nations had gathered To judgment before the white throne; And then came a bright, shining angel, Who stood on the land and the sea, And swore with his hand raised to Heaven That time was no longer to be.','The rich man was there, but his money Had melted and vanished away; A pauper he stood in the judgment, His debts were too heavy to pay; The great man was there, but his greatness, When death came, was left far behind! The angel that opened the records, No trace of his greatness could find.','The widow was there with the orphans, God heard and remembered their cries; No sorrow in heaven forever, God wiped all the tears from their eyes; The gambler was there, and the drunkard, And they who had sold them the drink, And those that had granted the license— Together in hell they did sink.','The moral man came to the judgment, But self-righteous rags would not do; The men who had crucified Jesus Had passed off as moral men, too; The soul that had put off salvation— ''Not yet; I''ll get saved by and by, No time now to think of religion!'' At last they had found time to die.']::text[], chorus_en='And, oh, what a weeping and wailing,
As the lost were told of their fate;
They cried for the rocks and the mountains,
They prayed, but their prayer was too late.' WHERE source_hymn_number=250;
UPDATE public.hymns SET verses_en=ARRAY['Sing aloud, ye Christian lands, Songs of greatest triumph, For your Lord has burst the bands— Lives no more to die. O sad the night the Lord lay dead; All earth was steeped in sorrow; But hail! He triumphed, as He said, And rose to reign on high.','Hallelujah! Praise the Lord! Raise the mighty anthem; Death is vanquished by His Word, Christ has made us free. The stone and seal, the guard at night, Their watch in silence keeping, Were all in vain, for in His might The Saviour rose again.','Praise the Lord! Exultant King! List! Angelic voices, As to earth the news they bring— Immortality! From out the tomb, in majesty, He came in radiant beauty, And rose with heavenly hosts to be The King eternally.']::text[], chorus_en='Sing we loud the chorus, Sending praise before us; Jesus reigns o''er us; King of kings is He. O sad the night the Lord lay dead; All earth was steeped in sorrow; But hail! He triumphed, as He said, And rose to reign on high.' WHERE source_hymn_number=172;

UPDATE public.hymns SET verses_yoruba=ARRAY['Aleluya! Orin t’o dun,
Ohun ayo ti ki ku;
Aleluya! Orin didun,
T’awon t’o wa lorun fe;
N’ile ti Olorun mi ngbe,
Ni won nko tosantoru.','Aleluya! Ijo t’orun,
E le korin ayo na,
Aleluya! Orin ‘Segun,
Ye awon ta rapada,
Awa ero at’alejo;
Iyin wa ko nilari.','Aleluya! Orin ayo,
Ko ye wa nigba gbogbo,
Aleluya! Ohun aro,
Da mo orin ayo wa;
Gba t’awa laye osi yi;
A ni gbawe f’ese wa.','Iyin dapo m’adura wa,
Gbo tiwa, Metalokan!
Mu wa de ‘waju Re layo,
K’ar’ Od’aguntan t’a pa;
K’a le ma ko Aleluya,
Nibe lae ati laelae.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20001;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. Gbogbo aye, gbe Jesu ga,
Angel'', e wole fun;
E mu ade Oba Re wa,
Se l''Oba awon Oba.','2. E se l''Oba eyin Martyr,
Ti npe ni pepe Re;
Gbe gbongbo igi Jese ga,
Se l''Oba awon oba.','3. Eyin iru omo Israel'',
Ti a ti rapada;
E ki Eni t''o gba yin la,
Se l''Oba awon oba.','4. Gbogbo eniyan elese,
Ranti ''banuje yin;
E te ''kogun yin s''ese Re,
Se l''Oba awon oba.','5. Ki gbogbo orile ede,
Ni gbogbo agbaye,
Ki won ki, kabiyesile,
Se l''Oba awon oba.','6. A ba le pel'' awon t''orun,
Lati ma juba Re;
K''a bale jo jumo korin,
Se l''Oba awon oba.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20002;
UPDATE public.hymns SET verses_yoruba=ARRAY['Olori ijo t’orun,
L’ayo l’a wole fun O,
Ki O to de, ijo t’aye;
Y’o ma korin bi t’orun’,
A gbe okan wa s’oke,
Ni ‘reti t’o ni ‘bukun,
Awa kigbe, awa f’iyin,
F’Olorun igbala wa.','‘Gbat’ awa ninu ‘ponju,
T’a nkoja ninu ina,
Orin ife l’awa o ko,
Ti o nmu wa sun mo O;
Awa sa pe, a si yo,
Ninu ojurere Re;
Ife t’o so wa di Tire,
Y’o se wa ni Tire lae.','Iwo mu awon eniyan Re;
Koja isan idanwo,
A ki o beru wahala,
Tori O wa nitosi,
Aye, ese, at’Esu,
Kojuja si wa lasan,
L’agbara Re a o segun,
Ao si ko orin Mose.','Awa f’igbagbo r’ogo,
Ti o tun nfe fi wa si;
A kegan aye nitori,
Ere nla iwaju wa,
Bi O ba si ka wa ye;
Awa pelu Stef’n t’o sun,
Y’o ri O bi O ti duro,
Lati pe wa lo s’orun.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20003;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. Mimo, Mimo, Mimo Olodumare,
Ni kutukutu n''Iwo O gbo orin wa;
Mimo, Mimo, Mimo! Oniyonu julo,
Ologo meta, lae Olubukun.','2. Mimo, Mimo, Mimo! Awon t''orun nyin,
Won nfi ade wura won le ''le yi ''te ka;
Kerubim, Serafim nwole niwaju Re,
Wo t''o ti wa, t''O si wa titi lae.','3. Mimo, Mimo, Mimo, p''okunkun pa o mo,
Bi oju elese ko le ri ogo Re,
Iwo nikan l''O mo, ko tun s''elomiran;
Pipe ''nu agbara ati n''ife.','4. Mimo, Mimo, Mimo! Olodumare,
Gbogbo ise Re n''ile l''oke l''o nyin O,
Mimo, Mimo, Mimo! Oniyonu julo;
Ologo meta lae Olubukun!
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20004;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. Gbogbo eyin ti ngbe aye,
E f''ayo korin s''Oluwa;
F''iberu sin, e yin l''ogo,
E wa s''odo Re, k''e si yo.','2. Oluwa, On ni Qlorun,
Laisi ''ranwo wa O da wa;
Agbo Re ni wa, O mbo wa;
O si fi wa s''agutan Re.','3. Nje, f''iyin wo ile Re wa,
F''ayo sunmo agbala Re;
Yin, k''e bukun oruko Re,
''Tori o ye be lati se.','4. Ese? rere l''Olorun wa,
Anu Re o wa titi lae,
Oto Re ko fi ''gbakan ye,
O duro lat'' irandiran.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20005;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. Oba aiku, airi, orisun ogbon,
To wa n''nu imole t''oju kole wo,
Olubukun julo, Ologo julo,
Alagbara, Olusegun, ''Wo la yin.','2. Laisimi, laiduro, ni idakeje,
O njoba LO, O ko si se alaini;
Giga ni idajo Re bi oke nla,
Ikuku Re b''isun ire at''ife.','3. O nte gbogbo eda alaye lorun,
Nipa imisi Re won ngbe igbe won,
A ndagba, a ngbile bi ewe igi,
Asi nro; sugbon bakanna l''Olorun.','4. Baba nla Ologo Imole pipe,
Awon angeli Re wole l''ese Re!
Iyin wa la mu wa, jo ran wa l''owo,
K''a le r''ogo imole to yi O ka.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20006;
UPDATE public.hymns SET verses_yoruba=ARRAY['Eje k’a f’inu didun,
Yin Oluwa Olore,
Anu Re, O wa titi,
Lododo dajudaju.','On nipa agbara Re,
F’ imole s’aye titun,
Anu Re, O wa titi,
Lododo dajudaju.','O mbo gbogb’ eda ‘laye,
O npese fun aini won,
Anu Re, O wa titi;
Lododo dajudaju.','O bukun ayanfe Re,
Li aginju iparun,
Anu Re, O wa titi,
Lododo dajadaju.','Eje k’a f’inu didun,
Yin Oluwa Olore,
Anu Re, O wa titi,
Lododo dajudaju.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20007;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. A f''ope f''Olorun,
L''okan ati l''ohun wa.
Eni s''ohun ''yanu,
N''nu eni t''araye nyo;
Gbat''a wa l''om''owo,
On na l''o ntoju wa,
O si nf''ebun ife,
Se ''toju wa sibe.','2. Oba Onib''ore,
Ma fi wa sile laelae,
Ayo ti ko l''opin,
On ''bukun y''o je ti wa,
Pa wa mo n''nu ore,
To wa, gb''a ba damu;
Yo wa ninu ibi,
L''aye ati l''orun.','3. K''a f''iyin on ope,
F''Olorun, Baba, Omo,
Ati Emi mimo;
Ti o ga julo lorun,
Olorun kan laelae,
T''aye at''orun nbo,
Be lo wa di sin yi,
Beni yo wa laelae.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20008;
UPDATE public.hymns SET verses_yoruba=ARRAY['Emi ‘ba n’egberun ahon,
Fun ‘yin Olugbala,
Ogo Olorun Oba mi,
Isegun ore Re.','Jesu t’o seru wa d’ayo,
T’o mu banuje tan,
Orin ni l’eti elese,
Iye at’ ilera.','O segun agbara ese,
O da onde sile,
Eje Re le w’ eleri mo,
Eje Re seun fun mi.','O soro, oku gb’ohun Re,
O gba emi titun,
Onirobinuje y’ayo,
Otosi si gbagbo.','Odi, e korin iyin Re,
Aditi, gbohun Re;
Afoju, Olugbala de,
Ayaro, fo f’ayo.','Baba mi at’Olorun mi,
Fun mi ni ‘ranwo Re;
Ki nle ro ka gbogbo aye,
Ola oruko Re.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20009;
UPDATE public.hymns SET verses_yoruba=ARRAY['E wole f’Oba, Ologo, julo,
E korin ipa ati ife Re;
Alabo wa ni at’ Eni igbani,
O ngbe ‘nu ogo, Eleru ni iyin.','E so t’ipa Re, e so t’ore Re;
‘Mole l’aso Re, gobi Re orun,
Ara ti nsan ni keke ‘binu Re je,
Ipa ona Re ni a ko si le mo.','Aye yi pelu ekun ‘yanu Re,
Olorun! Agbara Re l’o da won,
O fi idi re mule, ko si le yi;
O si f’okun se aso igunwa Re.','Enu ha le so ti itoju Re?
Ninu afefe ninu imole;
Itoju Re wa nin’ odo ti o nsan,
O si wa ninu iri ati ojo.','Awa erupe aw’alailera,
‘Wo l’a gbekele, O ki o da ni,
Anu Re rorun o si le de opin,
Eleda, Alabo, Olugbala wa.','‘Wo Alagbara Onife julo,
B’awon angeli ti nyin O loke,
Be l’awa eda Re, niwon t’a le se,
A o ma juba Re, a o ma yin O.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20010;
UPDATE public.hymns SET verses_yoruba=ARRAY['Fi iyin fun Jesu, Olurapada wa,
Ki aye k’ okiki ife Re nla,
Fi iyin fun! Eyin Angeli ologo,
F’ola at’ogo fun oruko Re;
B’Olus’agutan, Jesu y’o to Omo Re,
L’apa Re l’o ngbe won le l’ojojo;
Eyin eniyan mimo ti ngb’oke Sion;
Fi iyin fun pelu orin ayo.','Fi iyin fun, Jesu Olurapda wa,
Fun wa, O t’eje Re sile, O ku,
On ni apata, ati reti ‘gbala wa,
Yin Jesu ti a kan m’agbalebu;
Olugbala t’O f’ara da irora nla,
Ti a fi ade egun de l’ori,
Eniti a pa nitori awa eda,
Oba ogo njoba titi laelae.','Fi iyin fun, Jesu Olurapada wa,
Ki ariwo iyin gba orun kan,
Jesu Oluwa njoba lae ati laelae,
Se l’Oba gbogb’ eyin alagbara;
A segun iku; fi ayo royin na ka,
Isegun re ha da, isa oku?
Jesu ye ko tun si wahala fun wa mo,
‘Tori O l’agbara lati gbala.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20011;
UPDATE public.hymns SET verses_yoruba=ARRAY['Okan mi yin Oba orun,
Mu ore wa sode Re,
‘Wo ta wosan, t’a dariji
Tal’ aba ha yin bi Re?
Yin Oluwa, Yin Oluwa,
Yin Oba Ainipekun.','Yin fun anu t’o fi han
F’awon Baba ‘nu ponju;
Yin I Okan na ni titi
O lora lati binu,
Yin Oluwa, Yin Oluwa,
Ologo n’nu otito.','Bi Baba ni O ntoju wa,
O si mo ailera wa;
Jeje l’o ngbe wa lapa Re,
O gba wa lowo ota,
Yin Oluwa, Yin Oluwa,
Anu Re, yi aye ka.','A ngba b’itanna eweko,
T’afefenfe, t’o si nro,
‘Gbati a nwa ti a si nku,
Olorun wa bakanna;
Yin Oluwa, Yin Oluwa,
Oba Alainipekun.','Angel, e jumo ba wa bo,
Eyin nri lojukoju,
Orun, Osupa, e wole;
Ati gbogbo agbaye,
E ba wa yin, E ba wa yin,
Olorun Olotito.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20012;
UPDATE public.hymns SET verses_yoruba=ARRAY['Eyin Oba Ogo, On ni Olorun,
Yin I fun ‘se ‘yanu ti O ti fi han,
O wa pel’ awon ero mimo l’ona,
O si je imole won l’osan l’oru.','Eyin fun ‘rapada, ti gbogbo okan,
Eyin fun orisun imularada,
Fun inu rere ati itoju Re,
Fun ‘daniloju pe, O ngbo adura.','Eyin fun idanwo, bi okun ife,
T’o nso wa po mo awon ohun orun,
Fun ‘gbagbo ti nsegun ‘reti ti ki sa,
Fun ile Ogo t’O ti pese fun wa.
Amin.']::text[], chorus_yoruba='Eyin angeli didan lu duru wura,
Ki gbogbo nyin juba t’e nwo oju Re,
Ni gbogbo ‘joba Re, b’aye ti nyi lo,
Ise Re y’o ma yin,
Ise Re y’o ma yin,
Fi ibukun fun Oluwa okan mi.' WHERE hymn_number=20013;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. Si O Olutunu Orun,
Fun ore at''agbara Re,
A nko, Aleluya.','2. Si O, ife eni t''O wa,
Ninu Majemu Olorun,
A nko, Aleluya.','3. Si O, agbara Eni ti,
O nwe ni mo, t''o d'' opin,
A nko, Aleluya.','4. Si O, Oluko at''ore,
Amona wa toto d''opin,
A nko, Aleluya.','5. Si O, Eniti Kristi ran,
Ade on gbogbo ebun Re,
A nko, Aleluya.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20014;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ogo ni f’Oluwa to se ohun nla,
Ife lo mu k’O fun wa ni Omo Re,
Enit’O f’emi Re lele f’ese wa;
To si silekun iye sile fun wa.','Irapada kikun ti eje Re ra,
F’enikeni t’o gba ileri Re gbo,
Enit’o buruju b’o ba le gbagbo,
Lojukanna y’o ri idariji gba.','O s’ohun nla fun wa, O da wa l’ola,
Ayo wa di kikun ninu Omo Re,
Ogo ati ewa irapada yi,
Y’o ya wa lenu ‘gbat’ a ba ri Jesu.
Amin.']::text[], chorus_yoruba='Yin Oluwa, Yin Oluwa,
F’iyin fun Oluwa,
Yin Oluwa, Yin Oluwa,
E yo niwaju Re,
Ka to Baba wa lo l’Oruko Jesu,
Je k’a jo f’ogo fun Onise-yanu.' WHERE hymn_number=20015;
UPDATE public.hymns SET verses_yoruba=ARRAY['Fun anu t’o po b’iyanrin,
Ti mo ngba lojumo;
Lat’ odo Jesu Oluwa;
Ki l’emi o fi fun?','Kini un o fi fun Oluwa,
Lat’ inu okan mi?
Ese ti ba gbogbo re je,
Ko tile jamo nkan.','Eyi l’ohun t’emi o se
F’ohun t’O se fun mi:
Em’o mu ago igbala,
Uno kepe Olorun.','Eyi l’ope ti mo le da,
Emi osi, are;
Em’o ma soro ebun Re,
Uno si ma bere si.','Emi ko le sin bo ti to,
Nko n’ise kan to pe,
Sugbon em’o sogo yi pe,
Gbese ope mi po.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20016;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. Baba oke orun,
T''imole at'' ife,
Eni ''gbani,
''Mole t''a ko le wo;
Ife t''a ko le so,
Iwo Oba airi,
Awa yin O.','2. Kristi Omo laelae,
''Wo l''o di eniyan,
Olugbala,
Eni giga julo,
Olorun Imole;
Ai da at''ailopin,
A ke pe O.','3. Iwo Emi Mimo,
T''ina Pentikosi Re,
Ntan titi lae.
Ma sai tu wa ninu,
L''aye aginju yi,
''Wo l''a fe, ''Wo la nyin,
A juba Re.','4. Angel e lu duru,
K''orin t''awa, ti nyin,
Jumo dalu;
Ogo fun Olorun,
Metalokan soso;
A yin O tit'' aye,
Ainipekun.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20017;
UPDATE public.hymns SET verses_yoruba=ARRAY['Eni t’O f’orun sile t’O wa s’aye,
Lati ku fun ese araye gbogbo;
E korin Aleluya s’Oba mimo,
Eni ba more Jesu k’o ba wa gbe ga.','Eni t’O npa wa mo o, lojojumo,
Eni t’O nyo wa ninu ewu gbogbo,
Eni t’O npa Israeli mo k’itogbe;
Eni ba more Jesu k’o ba wa gbe ga.','Eni t’O npese fun aini wa l’aye,
Eni t’O nsore fun wa l’ojo gbogbo,
Ore t’O nse fun wa ko l’onka rara;
Eni ba more Jesu k’o ba wa gbe ga.
Amin.']::text[], chorus_yoruba='E ba wa yin Oluwa, Aleluya!
Eni ba more Jesu k’o ba wa gbe ga,
E ba wa yin Oluwa, Aleluya!
Eni ba more Jesu k’o ba wa gbe ga;
Eni ba more Re k’o ba wa gbe ga,
Eni ba more Re k’o ba wa gbe ga,
E ba wa yin Oluwa, Aleluya!
Eni ba more Jesu k’o ba wa gbe ga.' WHERE hymn_number=20018;
UPDATE public.hymns SET verses_yoruba=ARRAY['Okan mi yin Oluwa logo,
Oba iyanu t’O wa mi ri:
Uno l’agogo iyin y’aye ka,
Uno si fife Atobiju han.','Bi eranko l’emi ba segbe,
Bikose ti Oyigiyigi;
Lairotele l’Emi Mimo de;
T’O f’ede titun si mi l’enu.','Ayo okan mi ko se rohin,
Loro, losan, loganjo oru;
Gbat’ Emi Mimo ti de ‘nu mi;
Mo nkorin orun lojojumo.','Jesu ti la mi loju emi,
Mo si f’eti gbohun ijinle;
O nse faji ninu okan mi;
Kini mba fi fun Olugbala?','Em’o sogo ninu Oluwa,
K’emi ma ba di alaimore;
B’O ti pe mi iyanu l’o je,
Awon angel d’olulufe mi.','Mo damure lati sin Jesu,
Lai f’ota pe larin aye yi;
Nibikibi t’O ba nto mi si,
O daju ko ni jeki ndamu.','Bi mba pari ‘re-ije l’aye,
Olugbala, ma je ki npofo;
Ni wakati na jeki ngbo pe,
Bo sinu ayo ayeraye.
Amin.']::text[], chorus_yoruba='Oluwa, ope ni fun O,
Fun ore-ofe t’O fi yan mi,
Jowo dimi mu titi dopin;
Ki nle joba pelu Re loke.' WHERE hymn_number=20019;
UPDATE public.hymns SET verses_yoruba=ARRAY['Gbe Oluwa ga pelu mi,
Eyin eniyan Re,
Ki gbogbo eda alaye;
Ma yo l’oruko Re,
Fun ife ti O nfihan,
Fun isimi l’okan wa,
Fun igbala kikun Re,
Tire l’ope.','Eyin fun iwa-mimo Re,
Fun ore-ofe Re,
Korin iyin fun eje Re,
To fi ra wa pada;
Ife lo fi wa wa ri,
Ninu ira ese wa,
O f’ona iye han wa,
E fope fun.','Emi ‘ba l’egberun ahon,
Nko le royin na tan;
Ife Re si mi po jojo,
Ago ‘bukun mi nkun,
Ore-ofe ti ki ye,
Alafia bi odo,
Lat’ odo Olubukun;
E fope fun.
Amin.']::text[], chorus_yoruba='Ki gbogbo wa f’ope fun,
Ki gbogbo wa f’ope fun,
Ki gbogbo wa yin oruko;
Oluwa wa titi laelae,
Ani, titi laelae,
Ki gbogbo wa f’ope fun,
Ki gbogbo wa f’ope fun,
Ki gbogbo wa yin oruko,
Oluwa wa,
Titi laelae.' WHERE hymn_number=20020;
UPDATE public.hymns SET verses_yoruba=ARRAY['Oba ogo, alafia,
Un o feran Re;
Ife na ki y’o dekun,
Un o sunmo O;
N’tori O ti gbebe mi,
O ti gb’ohun mi;
O ka iwe aya mi,
O da mi n’de.','Fun idasile yi ni
Uno korin Re;
Gbogb’ayo okan mi ni
Uno mu fun O;
‘Gba t’ese mi nke kikan,
O da mi lare:
‘Gba mo pe O nikoko,
O gbebe mi.','Gbogb’ojo aye mi ni
Uno fi yin O;
Mo le gbe O ga ninu
Okan mi yi:
Aye wa n’nu okan mi
T’Iwo y’o ma gbe!
Ayeraye kuru ju
Lati yin O.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20021;
UPDATE public.hymns SET verses_yoruba=ARRAY['Gbo orin awon ayanfe,
Orin iyin titun;
T ‘Od’agutan t’a se logo,
Eyi ni orin won.','A fo aso wa n’n’eje Re,
O si funfun laulau;
Imole t’O tan s’okan wa,
F’ipa oto Re han.','A segun nipa eje Re,
‘Gba t’ esu gbogun de,
Agbara otito Kristi,
Lo f’okun s’apa wa.','Ka juba Od’agutan na,
Baba ‘ye on mole,
Tire l’ogo, ola, ipa,
‘Joba at’ agbara.
Amin.']::text[], chorus_yoruba='Ogo f’Eni to fe wa,
To f’eje Re we wa,
To w’ese at’ebi wa nu,
Nibi ‘san iye ni.' WHERE hymn_number=20022;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ji Okan mi, ba orun ji,
Mura si ise ojo Re.
Mase ilora, ji kutu.
K’o san ‘gbese ebo oro.','Ro gbogb’ojo t’o fi sofo,
Bere si rere ‘se loni,
Kiyesi ‘rin re l’aye yi,
Ko si mura d’ojo nla ni.','K’oro re gbogbo j’otito,
K’okan re mo b’osan gangan,
Mo p’Olorun nso ona re,
O mo ero ikoko re.','Nipa ‘mole ti nt’roun wa,
Tan ‘mole na f’elomiran;
Jeki ogo Olorun ‘han,
Ninu ife at’orun yin.','Ji, gbonranu ‘wo okan mi,
Yan ipo re l’arin angeli’,
Awon ti won nkorin iyin,
Ni gbogbo igba s’Oba wa.','Mo ji, mo ji, ogun orun,
Ki isin yin s’okan mi ji,
Ki nle lo ojo aye mi,
Fun Olorun mi bi ti yin.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20023;
UPDATE public.hymns SET verses_yoruba=ARRAY['Oluwa mi, mo njade lo,
Lati se ise onjo mi;
Iwo nikan l’emi o mo,
Loro, lero, ati n’ise.','Ise t’o yan mi l’anu Re,
Jeki nle se tayo tayo,
Ki nr’oju Re n’nu ise mi,
K’emi si le fi ‘fe Re han.','Dabobo mi lowo danwo,
K’opa okan mi mo kuro;
Lowo aniyan aye yi,
Ati gbogbo ifekufe.','Iwo t’oju Re r’okan mi,
Ma wa l’ow’otun mi titi,
Ki nma sise lo l’ase Re,
Ki nf’ise mi gbogbo fun O.','Je ki nreru Re t’o fuye,
Ki nma sora nigba gbogbo
Ki nma f’oju si nkan t’orun
Ki nsi mura d’ojo’ogo.','Ohunkohun t’O fi fun mi,
Je ki nle lo fun ogo Re,
Ki n f’ayo sure ije mi,
Ki nba O rin titi d’orun.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20024;
UPDATE public.hymns SET verses_yoruba=ARRAY['Wa s’adura ooro,
Kunle k’a gbadura,
Adura ni opa Kristian,
Lati b’Olorun rin.','L’osan, wole labe,
Apat’ayeraye,
Itura ojiji Re dun,
Nigba t’orun ba mu.','Je ki gbogbo ile,
Wa gb’adura l’ale;
Ki ile wa di t’Olorun
Ati ‘bode orun.','Nigbat’ od’oganjo,
Je k’a wi l’emi pe,
Mo sun, sugbon okan mi ji,
Lati ba O s’ona.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20025;
UPDATE public.hymns SET verses_yoruba=ARRAY['Baba mi, gbo t’emi,
‘Wo ni alabo mi,
Ma sun mo mi titi,
Oninure Julo.','Kristi Oluwa mi,
Iye at’ogo mi,
Ki ‘gba naa yara de,
Ti un o de odo Re.','Olutunnu julo,
‘Wo ti ngbe inu mi,
‘Wo t’O mo aini mi,
Fa mi, k’O si gba mi,','Mimo, Mimo, Mimo,
Ma fi mi sile lae,
Se mi ni bugbe Re,
Tire nikan laelae.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20026;
UPDATE public.hymns SET verses_yoruba=ARRAY['Wa ba mi gbe, ale fere le tan;
Okunkun nsu, Oluwa ba mi gbe,
Bi Oluranlowo, miran ba ye,
Iranwo alaini, Wa ba mi gbe.','Ojo aye mi nsare lo s’opin,
Ayo aye nku, ogo re nwomi,
Ayida at’ibaje ni mo n ri,
‘Wo ti ki yipada, wa ba mi gbe.','Ma wa l’eru b’Oba awon oba,
B’oninure, wa pelu ‘wosan Re,
Ki O si ma kanu fun egbe mi,
Wa, Ore elese, wa ba mi gbe.','Mo nfe O ri, ni wakati gbogbo,
Kilo le segun esu b’ore Re?
Tal’o le se amona mi bi Re?
N’nu ‘banuje at’ayo ba mi gbe.','Pelu ‘bukun Re, eru ko ba mi,
Ibi ko wuwo, ekun ko koro,
Oro iku da? Segun isa da?
Un o segun sibe, b’Iwo ba mi gbe.','Wa ba mi gbe, ni wakati iku,
Se ‘mole mi si toka si orun,
B’aye ti nkoja, k’ile orun mo,
Ni yiye, ni kiju, wa ba mi gbe.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20027;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ogo f’Olorun l’ale yi
Fun gbogbo ore Imole,
So mi, Oba awon Oba;
L’abe ojiji iye Re.','Oluwa f’ese mi ji mi,
Nitori omo Re, loni
K’emi le wa l’a alafia,
Pelu iwo ati aye.','Je k’okan mi le sun le O,
K’orun didun p’oju mi de,
Orun ti y’o m’ara mi le,
Ki nle sin O li owuro.','Bi mo ba dubule laisun,
F’ero orun kun okan mi,
Ma je ki nl’ala bururu,
Ma je k’ipa okun bo mi.','Yin Olorun, Ibu ore;
E yin, eyin eda aye,
E yin, eyin eda Orun,
Yin Baba, Omo on Emi.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20028;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ko su wa lati ma ko orin igbani,
Ogo f’Olorun Aleluya!
A le fi igbagbo korin na s’oke kikan.
Ogo f’Olorun, Aleluya.','Awa mbe n’nu ibu ife t’o ra wa pada,
Ogo f’Olorun Aleluya!
Awa y’o fi iye goke lo s’oke orun;
Ogo f’Olorun, Aleluya!','Awa nlo si afin kan ti a fi wura ko,
Ogo f’Olorun Aleluya!
Nibiti ao ri Oba Ogo n’nu ewa Re,
Ogo f’Olorun, Aleluya!','Nibe ao korin titun t’anu t’O da wa nde,
Ogo f’Olorun Aleluya!
Nibe awon ayanfe yo korin ‘yin ti Krist;
Ogo f’Olorun, Aleluya!
Amin.']::text[], chorus_yoruba='Omo Olorun ni eto lati bu s’ayo
Pe ona yi nye wa si,
Okan wa ns’aferi Re;
Nigb’o se a o de afin Oba wa Ologo
Ogo f’Olorun, Aleluya!' WHERE hymn_number=20029;
UPDATE public.hymns SET verses_yoruba=ARRAY['Jesu, a fe pade,
L’ojo Re mimo yi;
A si y’Ite Re ka,
L’ojo Re mimo yi;
Wo ore wa orun,
Adura wa mbo wa,
Bojuwa emi wa,
L’ojo Re mimo yi.','A ko gbodo lora,
L’ojo Re mimo yi,
Li eru a kunle,
L’ojo Re mimo yi;
Ma to gbogb’ ero wa,
K’Iwo k’o si ko wa,
K’a sin O b’o ti ye,
L’ojo Re mimo yi.','A teti s’oro Re,
L’ojo Re mimo yi,
Bukun oro t’a gbo,
L’ojo Re mimo yi,
Ba wa lo ‘gba t’a lo,
F’ore igbala Re;
Si aya wa gbogbo,
L’ojo Re mimo yi.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20030;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ojo mole l’eyi,
Ki ‘mole wa loni,
‘Wo orun ran s’okunkun wa,
K’o si le oru lo.','Ojo ‘simi l’eyi,
S’agbara wa d’otun,
S’ori aibale aya wa;
Se ‘ri itura Re.','Ojo alafia,
F’alafia fun wa:
Da iyapa gbogbo duro,
Si mu ija kuro.','Ojo adura ni;
K’aye sunmo orun;
Gb’okan wa s’oke sodo Re,
Si pade wa nihin.','Oba ojo l’eyi;
Fun wa ni isoji;
Ji oku okan wa s’ife;
‘Wo asegun iku.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20031;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ose, oso rere,
Iwo ojo simi;
O ye k’a fi ojo kan
Fun Olorun rere;
B’ojo mi ba m’ekun wa,
Iwo n’ oju wa nu;
Iwo ti s’ojo ayo,
Emi fe dide re','Ose Ose rere,
A k’yo sise loni;
A o f’ise wa gbogbo
Fun aisimi ola,
Didan l’oju re ma dan,
‘Wo arewa ojo;
Ojo mi nso ti lala,
Iwo nso ti simi.','Ose, Ose rere
Ago tile nwipe,
F’Eleda re l’ojo kan,
T’O fun o n’ijo mefa;
A o fi ‘se wa sile,
Lati lo sun nibe
Awa ati ore wa;
Ao lo sile adua','Ose, Ose rere,
Wakati re wu mi;
Ojo orun ni ‘wo se;
“Wo apere orun;
Oluwa, je ki njogun
‘Simi leyin iku;
Ki nle ma sin O titi,
Pelu eniyan Re.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20032;
UPDATE public.hymns SET verses_yoruba=ARRAY['Elese, e yipada,
Ese ti e o fi ku?
Eleda yin ni mbere,
Tofeki e ba On gbe;
Oran nla ni O mbi yin,
Ise owo Re ni yin;
A! Eyin alailope,
Ese t’ e o ko ‘fe Re?','Elese e yi pada,
Ese ti o o fi ku?
Olugbala ni mbere;
Eni t’O gb’emi yin la;
Iku Re y’o j’asan bi?
E o tun kan mo ‘gi bi?
Eni ‘rapada ese,
Te o gan or’ofe Re?','Elese, e yi pada,
Ese ti e o fi ku?
Emi mimo ni mbere,
Ti nfojo gbogbo ro yin;
E ki o ha gb’ore Re?
E o ko iye sibe?
Ati nwa yin pe, ese,
T’e mbi Olorun ninu?','Iyemeji ha nse yin,
Pe ife ni Olorun,
E ki o ha gboro Re?
K’e gba ileri Re gbo?
W’Oluwa lodo yin,
Jesu sun, w’omije Re;
Eje Re pelu nke pe;
Ese ti e o fi ku?
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20033;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ipe t’o n ‘bukun l’aoke orun,
Ipe t’o ni ‘bukun li emi npe wa,
O fi agbara fun eni ti n sare,
Eni t’o ba gbagbo, fun 0 ni.','Fun o ni ara fun O ni.
Gbekele ‘leri Re to daju (ara mi),
Fun o ni, ma, fun o ni,
Eni t’o ba gbogbo, fun o ni.','O ti f’eje Re ‘yebiye se ‘laja,
Omo Olorun ti sise igbala,
Gbogbo ise naa ti pari, o pari,
Lati gba ‘bukun na, fun o ni.','Y’o gba enl t’o ba gbagbo la d’opin,
Otito li eyi o da wa loju,
Gba ise otito ati ‘yanu yi,
Eni t’o ba gbagbo, fun o ni.','Ma siyemeji mo, wa’ do Re loni,
Kuro ninu ese re patapata,
‘Tori anu Re nla, y’o dariji o,
Y’o si s’amona re de orun.','Lohun ni ‘le ogo ao korin ‘yin Re,
Li ohun isegun; lae ati lae,
B’ipe na tile pe, sibe titun ni,
Ogo, Aleluya, fun o ni.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20034;
UPDATE public.hymns SET verses_yoruba=ARRAY['Wa nigbati Kristi npe o,
Wa, ma rin ‘na ese mo,
Wa, tu gbogb’ ohun t’o de O
Wa, bere ‘re ‘je t’orun.','Wa nigbati Kristi mbebe,
Wa, gbo ohun ife Re,
‘WO o ko ohun ife Re,
Wo o si ma sako sa','Wa mase f’akoko d’ola,
Wa, ojo ‘gbala ni ‘yi,
Wa fi ara re fun Kristi,
Wa wo ‘le niwaju Re.
Amin.']::text[], chorus_yoruba='O npe o nisiyi,
Gbo b’Olugbala ti npe,
O npe o nisiyi,
Gbo b’Olugbala ti npe.' WHERE hymn_number=20035;
UPDATE public.hymns SET verses_yoruba=ARRAY['Aye si mbe! Ile Od’agutan,
Ewa ogo re npe o pe “Ma bo”,
Wole, wole, wole nisisiyi.','Ojo lo tan, orun si fere wo,
Okunkun de tan, ‘mole nkoja lo,
Wole, wole, wole nisisiyi.','Ile iyawo na kun fun ase;
Wole, wole to oko ‘yawo lo;
Wole, wole, wole nisisiyi.','O nkun! O nkun! Ile ayo na nkun
Yara! Mase pe ko kun ju fun O!
Wole, wole, wole nisisiyi.','Aye si mbe? Ilekun si sile,
Llekun ife, iwo ko pe ju,
Wole, wole, wole nisisiyi.','Wole, wole! Tire ni Ase na.
Wa gb’ebun ‘fe ayeraye lofe!
Wole, Wole, wole nisisiyi.','Kiki ayo lo wa nibe, wole!
Awon angeli npe o fun ade,
Wole, wole, wole nisisiyi.','L’ohun rara n’ipe ife na ndun!
Wa ma jafara, Wole, ase na!
Wole, wole, wole nisisiyi.','K’ile to su, ilekun na le ti
‘Gbanao k’abamo! O se! O se!
O se, o se, ko s’aye mo; o se!
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20036;
UPDATE public.hymns SET verses_yoruba=ARRAY['Bi Krist’ ti da okan mi nde,
Aye mi ti dabi orun,
Larin ‘banuje at’aro;
Ayo ni lati mo Jesu,','Mo ti ro pe orun jina,
Sugbpn nigbati Jesu de;
L’orun ti de ‘nu okan mi,
Nibe ni y’o si wa titi.','Nibo l’a ko le gbe l’aye
L’o r’oke tabi petele,
L’ahere tabi agbala,
Ko s’ewu, Jesu wa nibe.
Amin.']::text[], chorus_yoruba='Aleluya! Ayo l’o je,
Pe, mo ti ri ‘dariji gba,
Ibikibi ti mo ba wa,
Ko s’ewu, Jesu wa nibe.' WHERE hymn_number=20037;
UPDATE public.hymns SET verses_yoruba=ARRAY['Bi mo ti ri, lai s’awawi,
Sugbon nitori eje Re,
B’o si ti pe mi pe ki nwa;
Olugbala, mo de.','Bi mo ti ri, laiduro pe,
Mo fe k’ okan mi mo toto,
S’odo Re to le we mi mo,
Olugbala, mo de.','Bi mo ti ri, b’o tile je,
Ija l’ode, ija ninu,
Eru l’ode, eru ninu,
Olugbala, mo de.','Bi mo ti ri, osi are;
Mo si nwa imularada,
Iwo le s’awotan mi,
Olugbala, mo de.','Bi mo ti ri ‘wo o gba mi,
‘Wo o gba mi, t’owo t’ese;
‘Tori mo gba ‘leri Re gbo;
Olugbala, mo de.','Bi mo ti ri ife Tire,
L’o sete mi patapata,
Mo di Tire, Tire nikan;
Olugbala, mo de.','Bi mo ti ri, n’nu fe nla ni,
T’o fi titobi Re han mi;
Nihin yi ati ni oke;
Olugbala, mo de.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20038;
UPDATE public.hymns SET verses_yoruba=ARRAY['Oluwa ran mi ni ‘se, Aleluya!
Iwo ni uno je ise na fun;
A ko s’inu Oro Re, Aleluya!
P’eni t’o ba wo Jesu y’o ye.','A ran mi n’ise ayo, Aleluya!
Uno j’isena fun o ore mi;
Ise lat’ oke wa ni; Aleluya!
Jesu SO, mo mo pe oto ni.','A n’owo iye si O, Aleluya!
A o fi ‘ye ailopin fun O;
T’o ba wo Jesu nikan, Aleluya!
Wo o, On nikan l’o le gbala.
Amin.']::text[], chorus_yoruba='Wo, k’o ye, Arakunrin,
Wo Jesu ki o si ye,
A ko s’inu Oro Re, Aleluya!
P’eni t’o ba wo Jesu y’o ye.' WHERE hymn_number=20039;
UPDATE public.hymns SET verses_yoruba=ARRAY['Olugbala, gb’ohun mi,
Gb’ohun mi, gb’ohun mi,
Mo wa s’odo Re, gba mi,
Nibi agbelebu di,
Emi se sugbon Oku;
Iwo ku, Iwo ku,
Fi anu Re pa mi mo,
Nibi agbelebu.','Ese mi po lapoju,
Uno bebe, un o bebe!
Iwo li Ona iye,
Nibi agbelebu,
Ore-ofe Re t’a gba,
L’ofeni! L’ofeni;
F’oju anu Re wo mi,
N’ibi agbelebu.','F’eje mimo Re we mi,
Fi we mi! Fi we mi!
Ri mi sinu ibu Re,
N’ibi agbelebu,
‘Gbagbo l’o le fun wa ni,
Dariji Dariji,
Mo f’igbagbo ro mo O,
N’ibi agbelebu.
Amin.']::text[], chorus_yoruba='Oluwa, jo gba mi,
Nki y’o bi O ninu mo!
Alabukun, gba mi,
Nibi agbelebu.' WHERE hymn_number=20040;
UPDATE public.hymns SET verses_yoruba=ARRAY['Oluwa, emi sa ti gb’ ohun Re,
O nso ife Re simi,
Sugbon mo fe nde l’ apa igbagbo,
Ki nle tubo sun mo O.','Ya mi si mimo fun ise Tire,
Nipa ore-ofe Re,
Je ki nfi okan igbagbo w’ oke,
K’ ife mi’si je Tire.','A! Ayo mimo ti wakati kan,
Ti mo lo nib’ ite Re;
‘Gba mo ngb’ adura si O, Olorun,
Ti a soro bi ore.','Ijinle ife mbe ti nko le mo,
‘Titi un o koja odo,
Ayo giga ti emi ko le so,
Titi uno fi de ‘simi.
Amin.']::text[], chorus_yoruba='Fa mi mora, mora, Oluwa,
Sib’ agbelebu t’O ku,
Fa mi mora, mora, mora Oluwa,
Sib’ eje Re t’on’iye.' WHERE hymn_number=20041;
UPDATE public.hymns SET verses_yoruba=ARRAY['Mo gbo Jesu wipe,
Agbara re kere,
Alare, sora, gbadua,
Pipe re mbe lodo mi.','Oluwa, toto mo mo,
P’agbara Re nikan;
Le s’adete di mimo,
O le m’okan lile ro.','Ko si ‘re ‘kan ti mo ni,
Lati ni ore Re,
Em’o fo aso mi mo,
N’n’ eje Jesu Oluwa.','Gbati ‘pe ‘keyin ba dun,
T’o n pe mi s’odo Re,
Jesu ti san gbogbo re,
E m’o ba g’oke orun.','N’iwaju ‘te uno duro,
N’nu pipe ewa Kristi,
Un o fi ade ogo ni;
Lele li ese Jesu.
Amin.']::text[], chorus_yoruba='Jesu san gbogbo,
‘Gbese ti mo je,
Ese to m’abawon wa,
Lo ti fo nu kuro.' WHERE hymn_number=20042;
UPDATE public.hymns SET verses_yoruba=ARRAY['Isun kan wu to kun f’eje,
T’o ti ‘ha Jesu yo,
Elese mokun ninu re,
O bo ninu ebi.','‘Gba mo f’igbagbo r’isun na,
Ti nsan fun eje Re,
Irapada d’orin fun mi,
Ti uno ma ko titi.','Orin t’o dun ju eyi lo,
Li emi o ma ko;
‘Gbati ore-ofe Re ba,
Mu mi de odo Re.','Mo gbagbo p’O pese fun mi,
Bi mo tile s’aiye,
Ebun ofe t’a feje ra,
Ati duru wura.','Duru t’a t’ow’ Olorun se,
Ti ko ni baje lae,
Ti ao ma fi yin Baba wa,
Oruko Re nikan.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20043;
UPDATE public.hymns SET verses_yoruba=ARRAY['B’eru ese re ba nwo o lorun,
Pe Jesu wole okan re;
B’o nd’aniyan isoji okan re,
Pe Jesu wole okan re.','Bi o ba nwa iwenumo kiri,
Pe Jesu wole okan re;
Omi ‘wenumo ko jina si o,
Pe Jesu wole okan re.','B’igbi wahala ba ngba o kiri,
Pe Jesu wole okan re;
B’afo ba wa ti aye ko le di,
Pe Jesu wole okan re.','Bi ore t’o gbekele ba da o;
Pe Jesu wole okan re;
On nikan ni Olubanidaro,
Pe Jesu wole okan re.','B’o nfe korin awon olubukun;
Pe Jesu wole okan re,
Bi o nfe wo agbala isimi,
Pe Jesu wole okan re.
Amin.']::text[], chorus_yoruba='Le ‘yemeji re sonu,
Ba Oluwa re laja;
Si okan re paya fun,
Pe Jesu wole okan re.' WHERE hymn_number=20044;
UPDATE public.hymns SET verses_yoruba=ARRAY['Gbogb’ ohun t’o nfa mi, mo fi ‘le,
Nihin ni Kenan’ mo ri ayo;
Alafia, ‘bukun ‘yebiye,
‘Tori mo ngbe Kenani n’siyi.','Mo ngbe lail’ewu nko je beru,
Olugbala mi wa nitosi,
‘Gba mo ba pe, y’o gbadura mi,
‘Tori mo ngbe Kenani n’siyi.','Mo mu omi kanga alaigbe,
Ni Kenan ibugbe ife mi!
Emi o so fun elomiran,
Pe emi ngbe n’ile Kenani.','Iyin ailopin ni mo mu wa,
Fun Jesu, Oba Irapapda;
Em’ o korin opo anu Re,
‘Tori mo ngbe Kenani n’ siyi.
Amin.']::text[], chorus_yoruba='Mo ngbe Kenani nisisiyi.
Nib’ owara ibukun gbe wa,
Nibi a ni opo oro oor’-ofe,
Mo n gbe Kenaan’ nisisiyi.' WHERE hymn_number=20045;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ki ‘sel’aini ‘reti,
Ni mo to ‘wa,
Ki’se laini’gbagbo,
Ni mo kunle,
Ese ti g’ ori mi,
Eyi sa l’ebe mi,
Eyi sa l’ebe mi,
Jesu ti ku.','A! Ese ni ipo ju,
O pon koka,
Ada le, ada le,
Ni mond’ese;
Ese aiferan Re,
Ese aigba O gbo,
Ese aigbo O gbo,
Ese nlanla.','Oluwa, mo jewo,
Ese nla mi,
‘O mo bi mo ti ri,
Bi mo ti wa;
Jo, we ese mi nu,
K’okan mi mo loni,
K’okan mi mo loni,
Ki ndi mimo.','Olododo ni O,
O ndariji,
L’ese agbelebu,
Ni mo wole;
Jek’eje iwenu;
Eje od’agutan,
Eje od’agutan,
We okan mi.','‘Gbana alafia,
Y’o d’okan jni,
‘Gbana uno ba O rin,
Ore airi;
Ore airi;
Em’ o f’ara ti O;
Jo ma to mi s’ona,
Jo ma to mi s’ona,
Titi aye.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20046;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ore-ofe, l’ ohun,
Adun ni l’eti wa;
Gbohun-gbohun re y’o gba orun kan,
Aye y’o gbo pelu.','Ore-ofe l’o ko,
Oruko mi l’orun,
L’o fi mi fun Od’agutan,
T’O gba iya mi je.','Ore-Ofe to mi,
S’ona alafia,
O ntoju mi l’ojojumo,
Ni irin ajo mi.','Ore-ofe ko mi,
Bi a ti ‘gbadura;
O pa mi mo titi d’oni,
Kosi je ki nsako.','Je k’ ore-ofe yi,
F’agbara fokan mi;
Ki nle fi gbogbo ipa mi,
At’ ojo mi fun O.
Amin.']::text[], chorus_yoruba='Ore-Ofe sa,
N’igbekele mi,
Jesu ku fun araye,
O ku fun mi pelu.' WHERE hymn_number=20047;
UPDATE public.hymns SET verses_yoruba=ARRAY['Apata ayeraye,
Se ibi isadi mi;
Je ki omi on eje,
T’o san lati iha Re;
Se iwosan f’ese mi,
K’o si so mi di mimo.','K’ise ise owo mi;
L’o le mu ofin Re se,
B’itara mi ko l’are,
T’omije mi nsan titi,
Won ko to fun etutu;
‘Wo nikan l’o le gbala.','Ko s’ohun ti mo mu wa,
Mo ro mo agbelebu;
Mo wa k’o d’aso bo mi,
Mo nwo O Fun iranwo;
Mo wa sib’ orisun ni,
We mi, Olugbala mi.','‘Gbati emi mi ba pin,
T’iku ba p’oju mi de,
Ti mba lo s’aye aimo,
Ki nri O n’ite ‘dajo;
Apata ayeraye;
Se ibi isadi mi.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20048;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ife l’o fi wa emi;
Ti eru ese npa,
O gbe mi s’ejika Re,
Pada bowa s’agbo;
Angeli nfi ayo korin;
Pelu awon ogun orun.','Mo gbogbe, mo fere ku,
O tu ororo si;
O so fun mi jeje pe:
“Temi ni iwo se!”
Nko gb’ohun t’o dun to ‘yi ri,
O mu okan are mi yo.','O f’apa iso han mi,
N’tori mi l’O jiya;
A de li ade egun;
Lati fi se esin;
Nko m’ohun t’O ri l’ara mi,
T’o fi jiya po be fun mi.','Mo joko niwaju Re,
N’nu ‘mole oju Re;
Mo si nfi iyanu nla,
Ranti ibukun Re;
Ayeraye fere ma to,
Lati fi korin iyin Re.','B’akoko ti nkoja lo,
N’isimi pipe de;
Mo nreti owuro ni;
Ti o dara julo,
‘Gba’ On y’o pe wa sodo Re,
B’iyawo Re, lailabawon.
Amin.']::text[], chorus_yoruba='A! Ife t’o wa mi,
A! Eje t’o ra mi,
Suru pelu ore-ofe Re;
T’o fa mi pada bo wa s’agbo!' WHERE hymn_number=20049;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ojo nla l’ojo ti mo yan,
Olugbala l’Olorun mi;
O ye ki okan mi ma yo,
K’o si ro ihin na kale.','Ise igbala pari na,
Mo di t’Oluwa mi loni;
On l’o pe mi, ti mo si je,
Mo f’ayo j’ipe mimo na.','Eje mimo yi ni mo je;
F’eni to ye lati feran:
Je k’orin didun kun ‘le RE,
Nigba mo ba nlo sin nibe.','Simi, aiduro okan mi,
Simi le Jesu Oluwa;
Tani je wipe aye dun,
Ju odo awon angeli?','‘Wo orun t o ngbo eje mi,
Y’o ma tun gbo lojojumo,
Tit’ ojo t’emi mi y’o pin;
Ni uno ma m’eje mi na se.']::text[], chorus_yoruba='Ojo nla l’ojo na;
Ti Jesu we ese mi nu;
O ko mi ki nma gbadura,
Ki nma sora, ki nsi ma yo,
Ojo nla l’ojo na;
Ti Jesu we ese mi nu.' WHERE hymn_number=20050;
UPDATE public.hymns SET verses_yoruba=ARRAY['‘Bikibi ti Jesu wa, ewu ko si,
‘Bikibi t’O to mi si n’nu aye yi;
Laisi Re, ayo kan ko le dun mo mi,
‘Bikibi ti Jesu wa, eru ko si.','‘Bikibi pelu Jesu ayo lo je,
B’ore miran ko mi, On ko je ko mi;
Bo tile mu mi koju isan ‘danwo,
‘Bikibi pelu Jesu ayo lo je.','‘Bikibi pelu Jesu ni mo le sun,
B’o tile je pe okunkun yi mi ka,
Mo mo pe uno ji si iye pelu Re;
‘Bikibi ti Jesu wa, ile lo je.
Amin.']::text[], chorus_yoruba='‘Bikibi pelu Re, kil’a o beru,
‘Bikibi ti Jesu wa, ewu ko si.' WHERE hymn_number=20051;
UPDATE public.hymns SET verses_yoruba=ARRAY['E dide, omo igbala,
Eyin t’e fe Oluwa,
Dide, ilu alagbara;
Ki ota to de Sion.','A ti gbe ‘ku mi ni ‘segun,
Lye wa mbe n’nu Kristi;
L’ojo ‘farahan Oluwa;
A o ho iho ayo.','Laipe ao de ‘bi ite Re;
Ao si mo Oba Ogo;
Nibe ao ke, “Kabiyesi”,
Gbogbo wa y’o gba ere.']::text[], chorus_yoruba='F’agbara re korin kikan,
Bi iro omi okun,
Nipa eje Kristi Jesu,
Awa ju asegun lo;
Awa ju asegun lo,
Awa ju asegun lo,
Nipa eje Kristi Jesu,
UPDATE public.hymns SET verses_yoruba=ARRAY['E ma te siwaju, Kristian ologun,
Ma tejumo Jesu t’O mbe niwaju,
Kristi Oluwa wa ni Balogun wa,
Wo! Asia Re wa niwaju ogun.','Ni oruko Jesu, ogun esu sa,
Nje Kristian ologun ma nso si isegun;
Orun apadi mi ni hiho iyin,
Ara, gb’ohun yin ga, gb’orin yin soke.','Bi egbe ogun nla n’Ijo Olorun,
A ra, an rin l’ona t’awon mimo nrin;
A ko ya wa ni ‘pa, egbe kan ni wa;
Okan ni ‘reti, ni eko ni ife.','Ite ati ‘joba wonyi le parun,
Sugbon Ijo Jesu y’o wa titi lae,
Orun – apadi ko le bor’ ijo yi,
A n’ileri Kristi, eyi ko le ye.','E ma ba mi kalo, eyin eniyan,
D’ohun yin po mo wa, l’orin isegun;
Ogo, iyin, Ola fun Kristi Oba!
Eyi ni y’o ma je orin wa titi.
Amin.']::text[], chorus_yoruba='E ma te siwaju, Kristian ologun;
Sa tejumo Jesu t’O mbe niwaju.' WHERE hymn_number=20053;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ha! Egbe mi e w’asia;
Bi ti nfe lele!
Ogun Jesu fere de na,
A fere segun.','Wo opo ogun ti mbo wa;
Esu nko won bo;
Awon alagbara nsubu,
A fe damu tan!','Wo asia Jesu ti nfe,
Gbo ohun ipe;
A o segun gbogbo ota;
Ni oruko Re.','Ogun ngbona girigiri,
Iranwo wa mbo;
Balogun wa mbo wa tete,
Egbe, tujuka!
Amin.']::text[], chorus_yoruba='D’odi mu, Emi fere de;
Beni Jesu nwi,
Ran ‘dahun pada s’orun, pe;
UPDATE public.hymns SET verses_yoruba=ARRAY['Duro, duro fun Jesu,
Eyin Om’ogun Krist’;
Gbe asia Re s’oke,
A ko gbodo fe ku;
Lat’ isegun de ‘segun,
Ni y’o to ogun Re;
Tit’ ao segun gbogb’ ota,
Ti Krist’ y’O j’Oluwa.','Duro, duro fun Jesu,
F’eti s’ohun ipe;
Jade lo s’oju ija;
Loni ojo nla Re;
Eyin akin ti nja fun,
Larin ainiye ota,
N’nu ewu e ni ‘gboya,
E ko ‘ju ‘ja s’ota.','Duro, duro fun Jesu,
Duro l’agbara Re;
Ipa eniyan ko to,
Ma gbekele tire,
Di ‘hamora ‘hinrere,
Ma s’ona, ma gbadua,
B’ise tab’ ewu ba pe,
Ma se alai de ‘be.','Duro, duro fun Jesu,
Ija na ki y’o pe;
Oni, ariwo ogun,
Ola, orin ‘segun!
Eni t’o ba si segun!
Y’o gba ade iye,
Y’o ma ba Oba ogo;
J’oba titi laelae.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20055;
UPDATE public.hymns SET verses_yoruba=ARRAY['Kristian mase jafara;
Gbo b’angeli re ti nwi:
Ni arin ota lo wa,
Ma sora.','Ogun orun apadi,
T’a ko ri nko ‘ra won jo;
Won nso ijafara re,
Ma sora.','Wo ‘hamora orun re,
Wo l’osan ati l’oru;
Esu ba, o nd’ode re;
Ma sora.','Awon to segun saju,
Won nwo wa b’awa ti nja;
Won nfi ohun kan wipe:
Ma sora.','Gbo b’Oluwa re ti wi,
Eni ti iwo feran;
F’oro Re si okan re;
Ma sora.','Ma sora bi enipe;
Nibe ni ‘segun re wa,
Gbadura fun ‘ranlowo,
Ma sora.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20056;
UPDATE public.hymns SET verses_yoruba=ARRAY['Asegun ati ajogun ni a je,
Nipa eje Kristi a ni isegun;
B’Oluwa je tiwa, a ki yo subu;
Ko s’ohun to le bori agbara Re.','A nlo l’oruko Olorun Israel,
Lati segun ese at’aisododo;
Kise fun wa, sugbon tire ni iyin,
Fun ‘gbala at’isegun ta f’eje ra.','Eni t’O ba si segun li ao fi fun,
Lati je manna to t’orun wa nihin;
L’orun yo si gbe imo ‘pe asegun,
Yo wo ‘so funfun, yo si dade wura.
Amin.']::text[], chorus_yoruba='Asegun ni wa, nipa eje Jesu;
Baba fun wa ni ‘segun, nipa eje Jesu;
Eni t’apa f’elese,
Sibe, O wa, O njoba;
Awa ju asegun lo,
Awa ju asegun lo.' WHERE hymn_number=20057;
UPDATE public.hymns SET verses_yoruba=ARRAY['Kristi Balogun wa niwaju ogun,
B’O ba ran wa n’ise a ko ni beru;
Bi ohun t’O fe se ko tile ye wa,
Sibe ao tele titi.','Gbogbo ifeju esu ko le mi wa,
Bi Kristi je asa at’apata wa;
Ao ma fi ida emi bi a ti nlo,
A o ma tele titi.','E je ki a gbe asia wa s’oke,
Ibi ko le de ibiti o ba wa,
Kristi, Balogun wa ti segun aye,
A o ma tele titi.','B’ogun na tile le ko ni pe pari;
Nigbana, ao dapo pe l’awon mimo;
Lati fi ayo ko orin isegun,
Bi aba tele titi.
Amin.']::text[], chorus_yoruba='Tesiwaju! L’ase Oluwa,
Te siwaju si ‘le ‘leri na;
Te siwaju ko orin soke,
Pelu Kristi, isegun daju.' WHERE hymn_number=20058;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. Olorun t''O mu Israel la okun ja,
Ti O si gba won kuro li oko eru;
Ti O ro ''jo onje sile lati orun,
Oun ni mo ngbadura si.','2. Olorun t''O gba Daniel lowo kiniun,
T''O si yo awon meta n''nu ina ''leru,
Eni ti awon irawo ngba Tire gbo,
Oun ni mo ngbadura si.','3. Olorun t''O f''oro Re d''afefe duro,
T''O si nso ''banuje oni d''ayo lola,
Eni ti O yi okuta ''boji kuro,
Oun ni mo ngbadura si.','4. Olorun t''O wo itanna igbe l''aso,
Eni t''O mu omi san n''iyangbe ile;
Ti O we elese mo ninu eri re,
Oun ni mo ngbadura si.
Amin.']::text[], chorus_yoruba='Okan na loni, okan na loni,
(Bakan na ni Olorun ti mo ngbadura si)
B'' akoko t''O sin Israel la okun;
(La okun ja)
Omo Re ni uno je, ''tori oro Re so,
Pe, okan na ni Olorun Iyanu loni.' WHERE hymn_number=20059;
UPDATE public.hymns SET verses_yoruba=ARRAY['Jesu mbo l’ofurufu pel’ayo,
Ojo ayo! Ojo ayo!
Awon t’o fe yo fo lo pade Re,
Ojo ayo! Ayo nla.
Won yo pade Oluwa ni sanma,
Gbogbo wa pelu Jesu yo wa nibe,
Ao bo lowo aniyan at’aro;
Ojo ayo! Ayo nla!','Awon obi, omo yo tun pade;
Ojo ayo! Ojo ayo!
Arakunrin pelu arabirin,
Ojo ayo! Ojo nla
Won mbe l’odo Krist’ a ko ri won mo,
Ibanuje ni lilo won je fun wa;
Sugbon ao pade laipe pel’ayo,
Ojo ayo! Ayo nla!','Gbogbo wa ha setan fun bibo Re?
Ojo ayo! Ojo ayo!
Omode ati agba ha se tan!
Fojo nla! Ojp ayo!
A nfe lati wa l’odo Re laelae
K’a le ma wo oju ati ewa Re,
Eyin ara, e korin nitori
Ojo nla na t’ao pade.','Awon miran ko ni le ba wa ko
Orin ayo ti ojo na!
Sugbon gbogbo wa ni ayo mbe fun
Ojo ayo! Ojo nla;
‘Tori Jesu nduro sibesibe,
K’a le mura tan nipa agbara Re,
Ninu ogo didan Re k’a le ni
Ibugbel’oke orun.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20060;
UPDATE public.hymns SET verses_yoruba=ARRAY['Jesu nikan li a nwasu;
Jesu nikan l’a nrohin,
Awa y’o gbe Jesu soke,
On nikan l’awa nfe ri.','Jesu ni Olugbala wa;
O ru gbogbo ebi wa,
Ododo Re lo gbe wo wa,
O ns’agbara wa d’otun.','Jesu l’o nso wa di mimo;
T’o nwe abawon wa nu,
O nsegun ese at’ ara;
Nipa iranwo Emi.','Jesu ni Oluwosan wa;
O ti ru ailera wa,
Nip’ agbara ajinde Re,
A ni ilera pipe.','Jesu nikan l’agbara wa;
Agbara Pentokosti,
Jo, da agbara yi lu wa;
F’Emi Mimo Re kun wa.','Jesu ni awa nduro de;
A nreti ohun ipe,
‘Gbat’O ba de, Jesu nikan;
Y’o je Orin wa titi.
Amin.']::text[], chorus_yoruba='Jesu nikan, Jesu nikan,
Jesu nikan l’orin wa,
Olugbala, Oluwosan;
Oba ti mbo lekeji.' WHERE hymn_number=20061;
UPDATE public.hymns SET verses_yoruba=ARRAY['Gbati ipe Oluwa ba dun,
T’aye y’o si fo lo,
Ti imole Ojo titun y’o si de;
Nigbati awon omo igbala ba pejo l’oke,
T’a ba si p’oruko nibe, uno wa m’be.','L’oro ojo na t’awon oku n’nu Kristi y’o jinde,
Ti won y’o si pin n’nu ogo ajinde;
‘Gbati awon ayanfe y’o peji si ode orun,
T’a ba si p’oruko l’ohun, uno wa n’be.','Jeki a fi gbogbo akoko wa sise f’Oluwa;
Jeki a royin ife iyanu Re;
Nigbati a ba si pari ire ije wa l’aye,
T’a’ba si p’oruko l’ohun, uno wa n’be.
Amin.']::text[], chorus_yoruba='‘Gbat’ a ba p’oruko l’ohun,
‘Gbat’ a ba p’oruko l’ohun,
‘Gbat’ a ba p’oruko l’ohun,
Nipa ore-ofe nikan, un o wa n’be.' WHERE hymn_number=20062;
UPDATE public.hymns SET verses_yoruba=ARRAY['Gba Jesu de lati fere fun wa,
Yala osan tab’ ale,
Y’o ha ba wa, ka ma f’oto sona,
K’atupa wa si ma jo?','Nje bo ba je oro kutukutu,
T’O ba pe wa ni kokan,
‘Gbat’ a ba da Talenti wa pada,
Y’O ha wi fun o, “o seun?','A ha soto s’eyi t’O fi fun wa?
Gbogbo ipa wa la nsa?
Ti ko ba si ‘dalebi l’okan wa,
‘Simi ologo lao ni.','‘Bukun l’awon ti Krist’ ri to nsona,
Won o pin nin’ ogo Re;
Bi l’aro tabi oganjo oru,
Y’O ha ba wa be nsona?
Amin.']::text[], chorus_yoruba='A ha le wipe, a se tan, ara,
Fun ‘le wa didan l’oke?
Wi, y’O ha ba ‘wo at’emi nsona?
Nsona, nsona n’gb’Oluwa o de?' WHERE hymn_number=20063;
UPDATE public.hymns SET verses_yoruba=ARRAY['‘Gbat’ O ba de ‘gba t’O ba de,
Lati sir’ oso Re;
Gbogb’ oso Re iyebiye,
Awon ti O fe.','Yi o ko jo, yi o ko jo,
Oso ijoba Re;
Awon mimo, awon didan,
Awon ti O fe.','Awon ewe, awon ewe,
T’o fe Olugbala;
Ni oso Re iyebiye,
Awon ti O fe.
Amin.']::text[], chorus_yoruba='Bi irawo owuro, won ns’ade Re loso,
Ewa won o yo pupo, ewa f’ade Re.' WHERE hymn_number=20064;
UPDATE public.hymns SET verses_yoruba=ARRAY['Fun mi n’iwa mimo; igbona okan,
Suru ninu iya; aro fun ese;
Igbagbo n’nu Jesu! Ki nmo ‘toju Re,
Ayo n’nu isin Re, emi adura.','Fun mi l’okan ope, igbekele Krist’;
Itara f’ogo Re; ‘reti n’n’ oro Re,
Ekun fun iya Re; ‘rora f’ogbe Re;
Irele n’nu ‘danwo; Iyin fun ‘ranwo.','Fun mi n’iwa funfun, fun mi n’isegun,
We abawon mi nu, fa ‘fe mi s’orun;
Mu mi ye ‘joba Re, ki nwulo fun O,
Ki nj’ alabukunfun; ki ndabi Jesu.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20065;
UPDATE public.hymns SET verses_yoruba=ARRAY['Nipa ife Olugbala,
Ki y’o si nkan;
Oju rere Re ki pada,
Ki y’o si nkan;
Owon l’eje t’o wo wa san;
Pipe l’edidi or’ofe;
Agbara l’owo t’o gba ni;
Ko le si nkan.','Bi a wa ninu iponju,
Ki y’o si nkan;
Igbala kikun ni tiwa,
Ki y’o si nkan,
Igbekele Olorun dun;
Gbigbe inu Kristi l’ere,
Emi si nso wa di mimo,
Ko le si nkan.','Ojo ola yio dara,
Ki y’o si nkan,
‘Gbagbo le korin n’nu ‘ponju;
Ki y’o si nkan,
Agbekele ‘fe Baba wa;
Jesu nfun wa l’ohun gbogbo;
Ni yiye tabi ni kiku;
Ko le si nkan.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20066;
UPDATE public.hymns SET verses_yoruba=ARRAY['Igbagbo mi duro l’ori,
Eje at’ ododo Jesu,
Nko je gbekele ohun kan,
Leyin oruko nla Jesu.','Mo duro le Kristi Apata,
Ile miran, iyanrin ni.','B’ire-ije mi tile gun,
Or’-ofe Re ko yi pada;
B’o ti wu ki iji na le to;
Idakoro mi ko niye.','Mo duro le Kristi Apata,
Ile miran, iyanrin ni.','Majemu, ati eje Re,
L’em’o ro mo, bi ‘kun mi de;
‘Gbati ko s’atileyin mo,
On je ireti nla fun mi.','Mo duro le Kristi Apata,
Ile miran, iyanrin ni.','‘Gbat’ipe ‘keyin ba si dun,
A! Mba le wa ninu Jesu;
Ki nwo ododo Re nikan;
Ki nduro niwaju ite.','Mo duro le Kristi Apata,
Ile miran, iyanrin ni.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20067;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ma f’ara fun ‘danwo, nitor’ ese ni,
Isegun kan yo tun fun O l’agbara;
Ja bi okunrin, si bori ‘fekufe,
Sa tejumo Jesu, y’O mu o laja.','Ma kegbe buburu, ma soro ibi,
Mase pe oruko Olorun l’asan;
Je eni ti nronu at’olotito;
Sa tejumo Jesu, y’O mu o la ja.','Olorun y’O f’ade f’eni t’o segun,
Ao fi ‘gbagbo segun, b’ota nde si wa;
Kristi y’O so agbara wa di otun,
Sa tejumo Jesu, y’O mu o la ja.
Amin.']::text[], chorus_yoruba='Bere ‘ranwo at’agbara lodo Olugbala,
O se tan fun iranwo, Oun y’O mu o la ja.' WHERE hymn_number=20068;
UPDATE public.hymns SET verses_yoruba=ARRAY['Y’o dahun gbogb’ adura;
Ileri ati ‘fe Re,
Ko sa ti yi pada ri;
Ogo f’oko Re.','Y’o dahun gbogb’ adura;
Uno ro mo ileri Re,
Mo mo On ko je da mi,
Ogo f’oko Re.','Y’o dahun gbogb’adura;
Je ka bere ni ‘gbagbo,
Emi Re nran ni lowo;
Ogo foko Re.','Y’o dahun gbogb’ adura,
Wa sibi ite anu;
O ri idaniloju;
Ogo foko Re.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20069;
UPDATE public.hymns SET verses_yoruba=ARRAY['Sa gbekele l’ojojo;
Gbekele l’arin ‘danwo,
Bi ‘gbagbo tile kere;
Gbekele Jesu nikan.','Emi Re ntan Imole,
Si ona okunkun mi;
L’owo Re, nko le subu,
Gbekele Jesu nikan.','B’ona ba mo uno ko’rin,
B’o ba di, uno gbadura;
Larin ewu, uno ke pe,
Gbekele Jesu nikan.','Gbekele titi d’opin,
Tit’aye yo fi koja;
Ti ao si de ‘nu ogo,
Gbekele Jesu nikan.
Amin.']::text[], chorus_yoruba='Gbekele ni ‘gbagbogbo,
Gbekele lojojumo;
Gbekele lonakona,
Gbekele Jesu nikan.' WHERE hymn_number=20070;
UPDATE public.hymns SET verses_yoruba=ARRAY['Aigbagbo bila! Temi l’Oluwa,
Oun O si dide fun igbala mi;
Ki nsa ma gbadura, Oun O se ‘ranwo,
‘Gba Krist’ wa lodo mi ifoya ko si.','B’ona mi ba su, Oun l’O sa nto mi,
Ki nsa gboran sa, Oun o si pese;
Bi iranlowo eda gbogbo saki,
Oro t’enu Re so, yo bori dandan.','Ife t’O fi han ko je ki nro pe;
Y’O fi mi sile ninu wahala;
Iranwo ti mo si nri lojojumo,
O nki mi l’aya pe, emi o la ja.','Emi o se kun ‘tori iponju,
Tabi irora, O ti so tele,
Mo m’oro Re p’awon ajogun ‘gbala,
Won ko le sai koja larin wahala.','Eda ko le so kikoro ago;
T’Olugbala mu k’elese le ye;
Aye Re tile buru ju temi lo;
Jesu ha le jiya, kemi si ma sa?','Nje b’ohun gbogbo ti nsise ire,
Fun awon to duro de Oluwa,
B’ oni tile koro, sa ko ni pe mo,
‘Gba na orin’segun yi o ti dun to?
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20071;
UPDATE public.hymns SET verses_yoruba=ARRAY['Alafia li aye ese yi?
Eje Jesu nwipe, “Alafia”.','Alafia ninu opo lala?
Lati se ife Jesu, ni simi.','Alafia n’nu igbi ‘banuje?
L’aya Jesu ni ‘dake roro wa.','Alafia, ‘gb’ara wa wa l’ajo?
Ni ‘pamo Jesu iberu ko si.','Alafia, ba ko tile m’ola?
A mo pe Jesu joba titi lae.','Alafia, nigb’akoko iku?
Olugbala wa ti segun iku.','O to! Jakadi aye fere pin,
Jesu y’O pe wa s’orun alafia.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20072;
UPDATE public.hymns SET verses_yoruba=ARRAY['Igbagbo mi wo O;
Iwo Od’agutan;
Olugbala,
Jo, gbo adura mi,
M’ese mi gbogbo lo;
K’emi lat’oni lo,
Si je Tire.','Ki ore-ofe Re,
F’ilera f’okan mi;
Mu mi tara;
B’Iwo ti ku fun mi,
A! K’ife mi si O,
K’o ma gbona titi;
B’ina iye.','‘Gba mo nrin l’okunkun;
Ninu ibanuje,
S’amona mi;
So okun di ‘mole;
Pa ‘banuje mi re,
Ki nma sako kuro;
Li odo Re.','Gba ti aye ba pin,
T’odo tutu iku;
Nsan l’ori mi,
Jesu, ninu ife,
Mu k’ifoya mi lo,
Gbe mi d’oke orun;
B’okan t’ara.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20073;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ona ara l’Olorun wa,
Ngba sise Re l’aye;
A nri ‘pase Re lor’okun,
O ngun igbi l’esin.','Ona Re, enikan ko mo,
Awamaridi ni;
O pa ise ijinle mo,
Oba awon oba.','Ma beru mo, eyin mimo,
Orun to su be ni,
O kun fun anu yo rojo;
Ibukun s’ori yin.','Mase da Oluwa l’ejo,
Sugbon gbeke re le;
‘Gbati o ro pe O nbinu,
Inu Re yo si o.','Ise Re fere ye wa na,
Y’o ma han siwaju;
Bi o tile koro loni,
O mbo wa dun lola.','Afoju ni alaigbagbo,
Ko mo ‘se Olorun;
Olorun ni Olutumo,
Y’O m’ona Re ye ni.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20074;
UPDATE public.hymns SET verses_yoruba=ARRAY['Awon to gbekele Oluwa,
Yio bori igbi idanwo;
Nitori ileri yi daju,
Ore-ofe mi to fun o.','Manna lat’orun li eyi je;
Fun awon ero mimo l’ona,
T’eru npa, to si nwa isimi,
Ore-ofe Mi to fun o.','Larin ire ije ti iye,
Bi are tile mu o subu:
Tun dide, ko si te siwaju;
Ore-ofe Mi to fun o.','Idanwo ati iyemeji,
At’ewu ko le ba ni l’eru;
‘Tori mo di ileri yi mu:
Ore-ofe Mi to fun o.
Amin.']::text[], chorus_yoruba='Ore-ofe mi to fun o,
Ore-ofe mi to fun o;
Ore-ofe ti ko l’egbe:
Ore-ofe mi to fun o.' WHERE hymn_number=20075;
UPDATE public.hymns SET verses_yoruba=ARRAY['B’o ti dun lati gba Jesu,
Gbo gegebi oro Re;
K’a simi lor’ ileri Re,
Sa gbagbo l’Oluwa wi.','B’o ti dun lati gba Jesu,
K’a gb’eje ‘wenumo Re;
Igbagbo ni ki a fi bo,
Sin ‘eje wenumo na.','B’o ti dun lati gba Jesu,
Ki nk’ara ese sile,
Ki ngb’ayo, iye, isimi;
Lati odo Jesu mi.','Mo yo mo gbeke mi le O,
Jesu mi, Alabukun;
Mo mo pe O wa pelu mi,
Ntoju mi titi dopin.
Amin.']::text[], chorus_yoruba='Jesu, Jesu, emi gbagbo,
Mo gbekele n’gbagbogbo,
Jesu, Jesu, Alabukun;
Ki nle gbekele O si.' WHERE hymn_number=20076;
UPDATE public.hymns SET verses_yoruba=ARRAY['Laifoya l’apa Jesu,
Laifoya l’aya Re;
Labe ojij’ ife Re,
L’okan mi o simi;
Gbo! Ohun angeli ni,
Orin won d’eti mi;
Lati papa ogo wa,
Lati okun Jaspa;
L’aifoya l’apa Jesu,
L’aifoya l’aya Re,
L’abe ojij’ ife Re;
L’okan mi o simi.','L’aifoya l’apa Jesu,
Mo bo low’ aniyan;
Mo bo lowo idanwo,
Ese ko nipa mo;
Mo bo lowo ‘banuje,
Mo bo lowo eru;
O ku idanwo die,
O k’omije die,
Laifoya l’apa Jesu;
Laifoya l’aya Re;
L’abe ojij’ ife Re,
L’okan mi o simi.','Jesu, abo okan mi,
Jesu ti ku fun mi;
Apata ayeraye,
L’emi o gbekele;
Nihin l’emi o duro,
Tit’ oru y’o koja;
Titi uno fi ri ‘mole,
Ni ebute ogo;
Laifoya l’apa Jesu,
Laifoya l’aya Re,
L’abe ojij’ ife Re;
L’okan mi Osimi.','2. L’aifoya l’apa Jesu,
Mo bo low’ aniyan;
Mo bo lowo idanwo,
Ese ko nipa mo;
Mo bo lowo ‘banuje,
Mo bo lowo eru;
O ku idanwo die,
O k’omije die,
Laifoya l’apa Jesu;
Laifoya l’aya Re;
L’abe ojij’ ife Re,
L’okan mi o simi.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20077;
UPDATE public.hymns SET verses_yoruba=ARRAY['B’oruko Jesu ti dun to,
L’eti onigbagbo;
O tan ‘banuje on ogbe,
O le eru re lo.','O wo okan t’o gb’ogbe, san,
O mu aya bale;
Manna ni fun okan ebi,
Isimi f’alare.','Apata ti mo kole le,
Ibi isadi mi;
Ile isura mi t’o kun;
F’opo ore-ofe.','Jesu, oko mi, ore mi,
Woli mi, Oba mi,
Alufa mi, Oba iye,
Gbo orin iyin mi.','Ailera l’agbara ‘nu mi;
Tutu si l’ero mi,
‘Gba mo ba ri O b’O ti ri,
Uno yin O b’o ti ye.','Tit’ igba na, ni ohun mi,
Y’o ma royin ‘ fe Re;
Nigba iku k’oruko Re,
F’itura f’okan mi.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20078;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. Mo ti ni Jesu l''ore, O j''ohun gbogbo fun mi;
Oun nikan l''Arewa ti okan mi fe,
Oun n''itanna ipado, On ni Enikan na;
T''O le we mi nu kuro n''nu ese mi;
Olutunu mi l''O je n''nu gbogbo wahala,
Oun ni ki n k''aniyan mi l''Oun lori,
Oun ni Itanna Ipado, Irawp owuro,
Oun nikan l''Arewa ti okan mi fe.','2. O gbe gbogbo ''banuje at''irora mi ru,
O j''odi agbara mi n''igba ''danwo;
''Tori Re mo k''ohun gbogbo ti mo ti fe sile,
O si f''agbara Re gbe okan mi ro;
Bi aye tile ko mi, ti Satani dan mi wo,
Jesu yo mu mi d''opin irin mi;
Oun ni itanna ipado, irawo owuro,
Oun nikan l''Arewa ti okan mi fe.','3. Oun ki y''o fi mi sile, be k''y''o ko mi nihin,
Niwon ti nba fi ''gbagbo p''afin Re mo;
O j''odi ''na yi ma ka, n ki y''o berukeru,
Y''o fi manna Re b''okan mi t''ebi npa,
''Gba mba d''ade n''ikeyin, uno r''oju ''bukun Re,
Ti adun Re y''o ma san titi lae,
Oun ni Itanna Ipado, irawo owuro,
Oun nikan l''Arewa ti okan mi fe.
Amin.']::text[], chorus_yoruba='Olutunu mi l''O je, n''nu gbogbo wahala,
Oun ni ki nk''aniyan mi l''On lori;
Oun ni Itanna ipado, Irawo owuro,
Oun nikan l''Arewa ti okan mi fe.' WHERE hymn_number=20079;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ore bi Jesu kosi laye yi,
Oun nikan l’ore otito,
Ore aye yi y’o fi wa sile;
Sugbon Jesu ko je gbagbe wa.','Akoko nkoja lo laifota pe;
A f’ojo kan sunmole wa si;
Onidajo mbo, gongo yi o so;
Awawi kan kosi l’ojo na.','Duro d’Oluwa, ma siyemeji,
Ohunkohun t’o wu ko le de;
‘Gbat’ o ro p’o pin ‘ranwo Re y’o de;
Eni ‘yanu l’Oba Oluwa.
Amin.']::text[], chorus_yoruba='Ah! Ko je gbagbe wa;
Ah! Ko je gbagbe wa;
Sugbon Jesu ko je gbagbe wa.' WHERE hymn_number=20080;
UPDATE public.hymns SET verses_yoruba=ARRAY['Mo nduro lori ileri Krist’ Oba,
Eniti a o ma yin titi laelae;
Ogo f’Olorun, emi yo ma korin;
Mo nduro lori ileri Re.','Mo nduro le ileri ti ko le ye,
Gbati iji ‘yemeji at’ eru ba de;
Nipa Oro Re li emi yo segun,
Mo nduro lori ileri Re.','Ileri Re la mi loju lati ri;
Iwenumo pipe ninu eje Re,
Ileri Re so okan mi d’om’nira;
Mo nduro lori ileri Re.','Mo nduro le ileri Krist’ Oluwa,
Ife lo fi so mi po mo ara Re;
Nipa oro Re mo nsegun lojojo;
Mo nduro lori ileri Re.
Amin.']::text[], chorus_yoruba='Emi nduro;
(Mo nduro de ‘leri, Mo nduro de ‘leri)
Emi nduro lori ileri Oluwa;
Emi nduro,
Emi nduro,
Emi nduro lori ileri Re.' WHERE hymn_number=20081;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ko s’ ore be Jesu onirele,
Ko s’ ore bi ti Re;
Ko s’ onisegun to le w’ese san,
Ko s’ ore bi ti Re.','Kos’ ore to ga bi Re ni mimo;
Ko s’ ore bi ti Re,
Ko s’ ore to n’irele bi ti Re,
Ko s’ ore bi ti Re.','Ko s’ akoko kan ti ko sunmo wa;
Ko s’ ore bi ti Re,
Ninu ‘danwo y’o ma tu wa ninu,
Ko s’ ore bi ti Re.','Awon t’o gbagbo mo L’Eni rere;
Kos’ore bi ti Re,
Awon t’o wa lode ngbohun ‘fe Re,
Kos’ore bi ti Re.','Ebun kan ha wa to ju Jesu lo?
Ko s’ ore bi ti Re;
Y’o ha ko fun wa k’a n’ile l’orun?
Ko je ko! Ko je ko!
Amin.']::text[], chorus_yoruba='Jesu mo gbogbo ‘jakadi wa,
Y’o ran wa lowo de opin;
Ko s’ ore bi Jesu onirele;
Ko s’ ore bi ti Re.' WHERE hymn_number=20082;
UPDATE public.hymns SET verses_yoruba=ARRAY['Jesu, ni b’eni Re pade,
Nibe, won r’ite anu Re,
Nibe, won wa O, won ri O;
Ibikibi ni ‘le owo.','Ko s’ogiri t’o se O mo,
O ngbe inu onirele;
Won mu O wa! Bi won ba wa,
‘Gba won nlo ‘le, won mu O lo.','Olus’agutan eni Re,
So anu Re ‘gbani d’otun;
So adun oruko nla Re,
Fun okan ti nwa oju Re.','Je k’a ripa adua nihin,
Lati so ‘gbagbo di lile;
Lati gbe ife wa soke,
Lati gb’orun ka ‘waju wa.','Oluwa ‘Wo wa nitosi,
N’apa Re, de ‘ti Re sile;
Si orun, sokale kankan;
Se gbogbo okan ni Tire.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20083;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ore wo l’a ni bi Jesu,
Ti o ru ‘banuje wa;
Anfani wo l’o po bayi;
Lati ma gbadura si?
Alafia pupo l’a nsonu,
A si ti je ‘rora po,
N’tori a ko nfi gbogbo kan;
S’adura niwaju Re.','Idanwo ha wa fun wa bi?
A ha ni wahala bi?
A ko gbodo so reti nu,
Sa gbadura s’Oluwa,
Ko s’oloto ore bi Re;
Ti o le ba wa daro,
Jesu ti mo ailera wa,
Sa gbadura s’Oluwa.','Eru ha nwo wa l’orun bi?
Aniyan ha po fun wa?
Olugbala je abo wa,
Sa gbadura s’Oluwa;
Awon ore ha sa O ti?
Sa gbadura s’Oluwa,
Y’o gbe o s’oke l’apa Re,
Iwo y’o si ni ‘tunu.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20084;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ma gbadura; Emi mbebe, n’nu re,
Fun gbogbo aini re igba-gbogbo.','Ma gbadura; l’abe eru ese,
Adura nri eje Jesu ti nsan.','Ma gbadura; b’are tile mu O,
Adura ngbe wa s’eba ‘te Baba.','Ma gbadura; n’nu wahala aye,
Adura l’o nfun okan n’isimi.','Ma gbadura; b’ayo ba yi o ka,
Adura nlu harp o nkorin angel’.','Ma gbadura b’awon t’o feran ku,
Adura mba won mu omi iye.','Gbogb’ ohun aye y’o b’aye koja,
Adura wa titi; ma gbadura.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20085;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ma koja mi, Olugbala,
Gbo adura mi;
‘Gbat’ Iwo ba np’ elomlran,
Mase koja mi.','N’ite anu, Je k’emi ri;
Itura didun,
T’edun t’edun ni mo wole;
Jo, ran mi lowo.','N’igbekele itoye Re,
L’em’ o w’oju Re;
Wo ‘banuje okan mi san,
F’ife Re gba mi.','4.’Wo orisun itunu mi,
Ju ‘ye fun mi lo,
Tani mo ni l’aye lorun;
Bikose iwo?
Amin.']::text[], chorus_yoruba='Jesu, Jesu, gbo adura mi;
‘Gbat’ Iwo ba np’elomiran,
Mase koju mi.' WHERE hymn_number=20086;
UPDATE public.hymns SET verses_yoruba=ARRAY['Fi ibukun Re tu wa ka,
Fi ayo kun okan wa;
K’olukuluku mo ‘fe Re;
K’a l’ayo n’nu ore Re;
Tu wa lara tu wa l’ara,
La aginju aye ja.','Ope at’ iyin l’a nfun O,
Fun ihinrere ayo;
Je ki eso igbala Re,
Po l’okan at’iwa wa;
Ki oju Re, ki oju Re;
Ma ba wa gbe titi lo.','Nje n’igbat’ a ba si pe wa,
Lati f’aye yi sile;
K’Angeli gbe wa lo s’orun,
L’ayo ni k’a j’ ipe na;
K’a si joba, k’a si joba;
Pelu Kristi titi lae.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20087;
UPDATE public.hymns SET verses_yoruba=ARRAY['Mo nfe O n’gbagbogbo,
‘Wo Olore;
K’o s’ohun bi Tire;
T’yo m’alafia wa.','Mo nfe O n’gbagbogbo;
Duro ti mi;
Idanwo ko n’ipa,
B’o wa n’tosi.','Mo nfe O n’gbagbogbo;
L’ayo, n’ise,
Yara wa ba mi gbe,
Asan l’aye.','Mo nfe O n’gbagbogbo:
Ko mi n’ife Re;
Mu ileri Re se,
Si mi l’ara.','Mo nfe O n’gbagbogbo,
Eni Mimo,
Se mi n’Tire toto;
Omo ‘bukun!
Amin.']::text[], chorus_yoruba='Mo nfe O, A! Mo nfe O,
Ni wakati gbogbo;
Bukun mi, Olugbala!
Mo wa s’odo Re.' WHERE hymn_number=20088;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ma toju mi, Jehoha nla,
Ero l’aye osi yi,
Emi ko l’okun, Iwo ni;
F’ow’ agbara di mi mu,
Onje orun, onje orun,
Ma bo mi titi laelae.','S’ilekun isun ogo ni;
Orisun im’arale;
Je ki imole Re orun,
Se amona mi jale;
Olugbala, Olugbala,
S’ agbara at’ asa mi.','‘Gba mo ba de eba Jordan;
F’okan eru mi bale,
Iwo t’o ti segun iku,
Mu mi gunle Kenan je;
Orin iyin, Orin iyin,
L’emi o fun O titi.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20089;
UPDATE public.hymns SET verses_yoruba=ARRAY['Wakati adura didun!
T’o gbe mi lo kuro l’aye,
Lo ‘waju ite Baba mi,
Ki nso gbogbo edun mi fun;
Nigba ‘banuje at’ aro,
Adua l’abo fun okan mi;
Emi si bo lowo esu;
‘Gbati mo ba gb’adua didun.','Wakati adura didun,
Iye Re y’o gbe ebe mi;
Lo sod’ Eni t’O se ‘leri;
Lati bukun okan adu’a,
B’O ti ko mi ki nw’oju Re,
Ki ngbekele, ki nsi gba gbo;
Uno ko gbogb’ aniyan mi le;
Ni akoko adua didun.','Wakati adura didun,
Je ki nma r’itunu Re gba;
Titi uno fi d’oke Pisga,
Ti uno r’ile mi l’ okere;
Uno bo ago ara sile,
Uno gba ere ainipekun,
Un o korin bi mo ti nfo lo!
O digbose adua didun.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20090;
UPDATE public.hymns SET verses_yoruba=ARRAY['Jesu nigba ‘danwo,
Gbadura fun mi;
K’emi ma ba se O,
Ki nsi sako lo,
‘Gba mba s’iyemeji;
Ko b’oju wo mi,
K’eru tab’ isaju,
Ma mu mi subu.','B’aye ba si nfa mi;
Pelu adun re,
T’ohun ‘sura aye,
Fe han mi l’emo,
Jo mu Getsemani;
Wa s’iranti mi,
Tabi irora Re,
L’oke Kalfari.','B’O ba pon mi l’oju;
Ninu ife Re,
Da ibukun Re le,
Ori ebo na;
Ki nf’ ara mi fun O,
L’ori pepe Re:
B’ara ko ago na,
Lgbagbo y’o mu.','‘Gba mo ba nre ‘boji,
Sinu ekuru;
T’ogo orun si nko,
L’eti bebe na;
Un o gbekel’ oto Re;
Ni ‘jakadi ‘ku;
Oluwa gb’emi mi,
S’iye ailopin.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20091;
UPDATE public.hymns SET verses_yoruba=ARRAY['Wa gba isimi re,
Mase je ‘rora mo,
Wa s’odo Jesu re,
Ma se jafara,','Okunkun l’aye yi
Lala inu re po,
Wa s’agb’ Olugbala
Mase jafara.','Gb’eru ese re wa,
Jesu ti ku fun o,
On y’o t’ewo gba o,
Mase jafara.','Igba ko duro pe,
Wawa l’akoko nlo,
Idajo si mbo wa,
Mase jafara.','Wa, awa mbe o, wa;
Wa, ye gb’oke gb’odo;
Wa mura fun ile,
Mase jafara.
Amin.']::text[], chorus_yoruba='Adura, ng’oke lo,
Angel’ nteri won ba,
Aye dapo mo won,
Mase jafara.' WHERE hymn_number=20092;
UPDATE public.hymns SET verses_yoruba=ARRAY['Tan ihin na kale, jakejado aye,
K’awon ti eru npa, mo pe igbala de:
K’awon ti se ti Krist’, so ihin ayo na,
Olutunu ti de.','Oba awon oba, wa f’iwosan fun wa,
O wa ja ide wa, O mu igbala wa,
K’olukuluku wa, korin isegun pe:
Olutunu ti de.','Ife iyanu nla, a! Mba le royin na,
Fun gbogbo eniyan, ebun or’ofe Re;
Emi omo egbe, di omo igbala,
Olutunu ti de.','Gbe orin ‘yin soke, s’Olurapada wa,
K’awon mimo loke, jumo ba wa gberin;
Yin ife Re titi, ife ti ko le ku,
Olutunu ti de.
Amin.']::text[], chorus_yoruba='Olutunu ti de, Olutunu ti de,
Emi lat’ oke wa, ileri Baba wa;
Tan ihin na kale, jakejado aye,
Olutunu ti de.' WHERE hymn_number=20093;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ji, apa Olorun, ko ji,
Gbe ‘pa Re wo, mi orile;
Ni sisin Re, je k’aye ri;
Isegun ise anu Re.','T’ite Re wi fun keferi,
“Emi Jehofa Olorun”;
Ohun Re yo d’ede won ru,
Yi o wo pepe won lule.','Ki ‘gb’ ojurere Sion’ de,
Ka m’eya Israel’ wa ‘le;
N’iyanu ka f’oju wa ri,
Keferi, Ju, l’agbo Jesu.','Olugbala kede ‘fe Re,
L’orile at’ ede gbogbo;
Ki gbogb’ ota wole fun O;
Ki won gba Jesu l’Oluwa.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20094;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. Ma sise lo, mase sare,
Fi ayo sise Baba re,
Bayi ni Jesu se l''aye:
Ko ha ye k''awa ko se be.','2. Ma sise lo ki se lasan,
Ofo aye l''ere orun:
Bi araye ko fe yin o;
Iyin Jesu ju t''eda lo.','3. Ma sise, l''ojojumo,
Okunkun aye fere de;
Mura si ''se, mase s''ole,
Ko ba le gba okan re la.','4. Pupo, pupo l''awon to ku,
Ti won ko n''ireti orun,
Gbe ina ''gbagbo re, ma fi;
Ma fi si okunkun aye.','5. Ma sise lo, ma gbadura:
F''ogbon wa awon to sina;
Jade lo s''opopo ona,
Ro asako lati wole.','6. Ma sise lo, ma yo pelu,
Lehin ise ''wo o simi;
O fere gb''ohun Jesu na;
Y''O ke tantan pe, "Emi de".
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20095;
UPDATE public.hymns SET verses_yoruba=ARRAY['Iwo ti okunkun;
Gb’oro agbara Re,
To si fo lo:
Gbo ti wa, a nbe O,
Nibit’ ihinrere;
Ko ti tan mole re,
K’imole wa.','‘Wo t’iye apa Re;
Mu iriran w’aye,
At’ilera:
Ilera ti inu;
Iriran ti okan;
Fun gbogbo eniyan,
K’imole wa.','Iwo Emi oto,
Ti o n f’iye fun wa,
Fo kakiri:
Gbe fitila anu;
Fo ka oju omi,
Ni ‘bi okunkun nla,
K’imole wa.','Metalokan Mimo,
Ogbon, ife, Ipa,
Alabukun!
B’igbi omi okun;
Ti nyi ni ipa re,
Be ka gbogbo aye,
K’imole wa.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20096;
UPDATE public.hymns SET verses_yoruba=ARRAY['Krist’ ki ‘joba Re de,
Ki ase Re bere;
F’opa irin Re fo;
Gbogbo ipa ese.','Ijoba ife da?
Ati t’alafia;
‘Gba wo ni irira,
Yio tan bi t’orun?','Akoko na ha da;
T’ote yio pari;
Ika ati ‘reje,
Pelu ifekufe?','Oluwa, jo dide,
Wa n’nu agbara Re;
Fi ayo fun awa,
Ti o ns’aferi Re.','7Eda ngan oko Re,
Koko nje agbo Re,
Iwa ‘tiju pupo;
Nfihan pe ‘fe tutu.','Okun bole sibe,
Ni ile keferi,
Dide ‘Rawo oro,
Dide mase wo mo.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20097;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. E fun ''pe na kikan,
Ipe ihinrere;
K''o dun jake jado,
L''eti gbogbo eda.','2. Jesu Alufa wa;
Ti s''etu lasepe:
Alare, e simi,
Asofo, tujuka.','3. Fun''pe t''Od''agutan,
Ta ti pa setutu;
Je ki agbaye mo,
Agbara eje Re.','4. Eyin eru ese;
E so ra yin d''omo;
Lowo Kristi Jesu,
E gb''ominira yin.','5. Gbo ''pe ihinrere,
Ihin ore-ofe;
Agba yin low'' aye,
E wa ''waju Jesu.
Amin.']::text[], chorus_yoruba='Odun idasile ti de,
Pada elese, e pada.' WHERE hymn_number=20098;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ji, so agbara Re d’otun,
Gbe ‘hamora ogun re wo;
A o segun gbogbo ota,
Kristi yo si joba.','O ti pe t’awon omo Re,
Ti nse ‘yapa lori eko;
Won gbagbe pe l’ori ‘sokan,
Ni On lo aye Re.','E papo li agbara Re,
Aye yin yoo si je ere;
Laipe e o ni isegun,
‘Tori Krist’ y’o joba.','O ye ka sise f’Oluwa,
Ise wa ko ni je asan;
A ko gbodo pada s’ehin,
‘Tori Krist’ y’o joba.
Amin.']::text[], chorus_yoruba='Krist’ y’o joba,
Krist’ y’o joba,
Ireti wa n’nu Re ko ye;
Krist’ y’o joba,
Krist’ y’o joba,
Krist’ y’o joba,
Ireti wan’nu Re ko ye;
Krist’ y’o joba.' WHERE hymn_number=20099;
UPDATE public.hymns SET verses_yoruba=ARRAY['Un o ha lo ni owo ofo?
Ki nlo pade Jesu be?
Nko iti eise ojo kan fun;
Nko iti mu enikan wa.','Iku ko lo nderuba mi;
Tori Jesu ti gba mi,
Pe mo nlo ni owo ofo,
Iro yi mb’okan mi je.','A! Akoko ti mo sonu;
Mba le pe won pada bo,
Mba fi won fun Oluwa mi,
Ife Re ni mo fe se.','Enyin mimo, tara sise;
Sise, ‘gbati se osan,
Ki igbe aye yin to pin,
So eso fun Oluwa.
Amin.']::text[], chorus_yoruba='Un o ha lo ni owo ofo?
Un o ha pade Jesu be?
Ko si eso kan lowo mi,
Ti mo le mu pade Re?' WHERE hymn_number=20100;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ipe na ndun l’otun ati l’osi pe,
Tan ‘mole, tan ‘mole;
Opo l’o nku laini ireti orun;
Tan ‘mole tan ‘mole.','Awon t’o wa l’ okunkun nke tantan pe;
Tan ‘mole, tan ‘mole,
Mu won wa jeje s’ ibi agbelebu,
Tan ‘mole, tan ‘mole.','Je k’a gbadura k’ or’ ofe le joba;
Tan ‘mole, tan ‘mole;
Ki Emi Krist’ joba ni ibi gbogbo,
Tan ‘mole, tan ‘mole.','Je k’ a teramo ise t’o l’ere yi;
Tan ‘mole, tan mole,
Ao gbade nikehin bi a foriti;
Tan’mole, tan mole.
Amin.']::text[], chorus_yoruba='Tan ‘mole ihinrere na,
Je k’ o tan yi aye ka;
Tan ‘mole ihinrere na;
Je k’ o tan yi aye ka.' WHERE hymn_number=20101;
UPDATE public.hymns SET verses_yoruba=ARRAY['Yo awon ti nsegbe, sajo eni nku,
F’anu ja won kuro ninu ese;
Ke f’awon ti nsina gb’eni subu ro,
So fun won pe, Jesu le gba won la.','Bi won tile gan, sibe O nduro;
Lati gb’omo t’o ronupiwada;
Sa f’itara ro won, si ro won jeje,
On o dariji bi won je gbagbo.','Ero okan eda ti esu te pa,
Ni ore-ofe le tun mu pada;
Okan ti o gb’ogbe, t’a fowo ife,
At’inu rere soji, y’o korin.','Yo awon ti nsegbe – ise tire ni,
Oluwa yio f’agbara fun o;
Fi suru ro won pada s’ona toro,
So f’asako p’Olugbala ti ku.
Amin.']::text[], chorus_yoruba='Yo awon ti nsegbe, sajo eni nku,
Alanu ni Jesu, yio gbala.' WHERE hymn_number=20102;
UPDATE public.hymns SET verses_yoruba=ARRAY['Keferi nsegbe l’ojojo,
Egbegberun lo nkoja lo;
Mura Kristian s’ igbala won;
Wasu fun won, ki won to ku.','E yonda owo, at’ebun,
At’emi yin, ki won le ye;
Jesu se ohun nla fun yin,
Kil’ ohun te ki o se fun?','Emi Oluwa, fo kiri,
Jakejado ile aye;
Ko awon om’ Olorun jo;
Lati gbogbo oril’ ede.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20103;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. Jesu ye titi aye,
Eru iku ko ba mi mo;
Jesu ye; nitorina,
Isa oku ko n''ipa mo.
Aleluya.','2. Jesu ye, lat'' oni lo,
Iku je ona si iye;
Eyi y''o je ''tunu wa,
''Gbat'' akoko iku ba de.
Aleluya.','3. Jesu ye; fun wa lo ku,
Nje Tire, ni a o ma se;
A o f okan funfun sin,
A o f''ogo f''Olugbala.
Aleluya.','4. Jesu ye; eyi daju,
Iku at''ipa okunkun,
Ki yo le ya ni kuro,
Ninu ife nla ti Jesu.
Aleluya.','5. Jesu ye; gbogbo ''joba
L''orun, li aye, di Tire;
E je ki a ma tele,
Ki a le joba pelu Re.
Aleluya.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20104;
UPDATE public.hymns SET verses_yoruba=ARRAY['ALELUYA, ALELUYA, ALELUYA!','1. Ija d''opin, ogun sitan,
Olugbala jagun molu,
Orin ayo lao ma ko; - Aleluya!','2. Gbogbo ipa n''iku ti lo,
Sugbon Kristi f''ogun re ka;
Aye! e ho iho ayo; - Aleluya!','3. Ojo meta na ti koja;
O jinde kuro nin'' oku;
E f''ogo fun Oluwa wa. - Aleluya!','4. O d''ewon orun apadi,
O silekun orun sile,
E korin iyin ''segun Re. - Aleluya!','5. Jesu, nipa iya t''O je,
Gba wa lowo oro iku,
K''a le ye, ka si ma yin O. - Aleluya
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20105;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. O f''ara Re fun mi,
O ku nitori mi,
K''O le ra mi pada,
Ki nle jinde n''n'' oku,
O fara Re fun mi,
Ki l''emi se fun O?','2. O f''ojo aye Re,
Se wahala fun mi;
Ki emi ba le mo
Adun ayeraye,
O l''op'' odun fun mi
Mo lo kan fun O bi?','3. Ile ti Baba Re
At''ite ogo Re
O fi sile w''aye
O d'' alarinkiri
O fi ''le ''tori mi,
Mo fi nkan fun O bi?','4. O jiya po fun mi,
Ti enu ko le SO
O jijakadi nla
''Tori igbala mi,
O jiya po fun mi,
Mo jiya fun O bi?','5. O mu igbala nla
Lat'' ile Baba Re
Wa lati fifun mi,
O si dariji mi.
O m''ebun wa fun mi
Kin'' mo mu wa fun O?','6. Uno f''ara mi fun O,
Uno f''aye mi sin 0.
Uno d''iju si aye,
Uno wo ohun t''orun,
Mo f''ohun gbogbo mi
F''Oluwa, Oba mi.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20106;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. Ma wi, ''tori ''ranse Re gbo,
Mo duro de oro Re;
Mo fe gb''ohun iwosan Re;
Je k''emi gbo, Oluwa,
Kristi, mo t''eti sile;
S''ohun t''o fe wi fun mi.','2. Ma wi, pe mi, Oluwa mi,
Je ki nle mo ohun Re:
Ma wi, ki nyara te le O,
Kin sun mo O girigiri;
Nibit'' O nto agbo Re;
Labe ibi itura.','3. Ma wi, yala l''ohun jeje,
Ma je k''emi lo laigbo;
Ma wi, Oluwa, Iwo mo;
Gbogbo ero okan mi,
Iwo m''ohun ti mo fe;
So mi di eni ''bukun.','4. Ma wi, je ki emi mura,
Bi mo ba ti gb''ohun Re;
Pelu ''gboran ati ayo,
Ni ki nfi tel'' oro Re,
Kristi, mo teti sile;
Ma wi, Oluwa ma wi.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20107;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. B''Olorun Oba orun;
Ti ma nsoro n''igba ni;
O tun ba wa soro be loni,
Arakunrin oto ni,
Ohun t''O ba wi fun o;
Ohun kan l''aigbodo-mase gboran.','2. Bi o ba je t''Oluwa;
O ni lati gbo tire,
Ko s''onu ''hinrere miran mo;
Mase sa ase Re ti;
Ma si se lo oro Re,
''Gbat'' Olugbala ba nsoro, sa gbo.','3. Bi o ba fe ni ipin,
Ni ''lu daradara ni,
Leyin aye wa buburu yi;
Bi o ko tile m''ona,
Krist'' y''o wipe, "tele Mi"
Igbagbo yo si wipe, ""sa gboran""
Amin.']::text[], chorus_yoruba='Sa gboran, sa gboran;
Eyi ni ''fe Re,
''Gbat'' O ba ranse si o,
Ohun kan ni ki o se;
Sa gboran, sa gboran.' WHERE hymn_number=20108;
UPDATE public.hymns SET verses_yoruba=ARRAY['Bibeli mimo t’orun,
Owon itura temi!
‘Wo ti nwi bi mo ti ri;
‘Wo ti nso bi mo ti wa.','‘Wo nko mi bi mo sina,
‘Wo nfi ‘fe Oluwa han;
‘Wo l’O si nto ese mi,
‘Wo l’O ndare, at’ebi.','‘Wo ni nma tu wa ninu,
Ninu wahala aye;
‘Wo nko ni nipa ‘gbagbo,
Pe, a le segun iku.','‘Wo l’O nso t’ayo ti mbo,
Ati ‘parun elese;
Bibeli mimo t’orun,
Owon isura temi.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20109;
UPDATE public.hymns SET verses_yoruba=ARRAY['Jesu oro Re ye,
O si nto ‘sise wa,
Eni t’o ba gba gbo,
Y’o l’ayo oun ‘mole.','Nigb’ ota sunmo wa,
Oro Re l’odi wa;
Oro itunu ni,
Iko igbala ni.','B’igbi at’okunkun;
Tile bo wa mole;
‘Mole Re yo to wa,
Y’o si dabobo wa.','Tani le so ayo,
To le ka isura;
Ti oro Re nfi fun;
Okan onirele.','Oro anu o nfi,
‘Lera fun alaye;
Oro iye o nfi,
Itunu feni nku.','Awa iba le mo;
Eko ti O nkoni;
Ki a ba le fe O,
K’a si le sunmo O.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20110;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. Di Bibeli mu b''ohun miran kuna,
Ma so ilana Re to s''owon nu;
Ihin ayo Re njo okan ti ntogbe;
Iye si ni ''leri re je fun o.','2. Di Bibeli mu, ''sura ''yebiye ni;
O nf''iye anipekun f''araye;
Ko si ida na to le won iye re;
Wa ibukun re nigba to le ri.','3. ''Mole ni fun gbogbo awon asako,
Amona fun odo t''iba subu;
''Reti f''elese t''aye re ti daru,
Opa f''ogbo iwe to dara ju.
Amin.']::text[], chorus_yoruba='Di Bibeli mu! Di Bebeli mu!
Oluto, amoona lo je fun wa.' WHERE hymn_number=20111;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ojo ibukun y’o si ro;
Ileri ife l’eyi;
A o ni itura didun,
Lat’ odo Olugbala.','Ojo ibukun y’o si ro,
Isoji iyebiye;
L’ori oke on petele,
Iro opo ojo mbo.','Ojo ibukun y’o si ro,
Ran won si wa, Oluwa;
Fun wa ni itura didun,
Wa f’ola fun oro Re.','Ojo ibukun y’o si ro,
Iba je le ro loni!
B’a ti njewo f’Olorun wa;
T’a npe oruko Jesu.
Amin.']::text[], chorus_yoruba='Ojo ibukun,
Ojo ibukun l’a nfe,
Iri anu nse yi wa ka;
Sugbon ojo l’antoro.' WHERE hymn_number=20112;
UPDATE public.hymns SET verses_yoruba=ARRAY['‘Gbat’ a b’Oluwa rin,
N’nu ‘mole oro Re;
Ona wa yio ti mole to!
‘Gbat’ a ba nse ‘fe Re,
On y’o ma ba wa gbe,
Ati awon t’o gbeke won le.','Ko s’ohun to le de,
Loke tabi n’ile,
To le ko agbara Re l’oju;
Iyemeji, eru,
Ibanuje, ekun;
Ko le duro, bi a gbekele.','Ko si wahala mo,
Tabi ibanuje,
O ti san gbogbo ‘gbese wonyi;
Ko si aro kan mo,
Tabi ifajuro,
Sugbon ‘bukun b’a ba gbekele.','A ko le fenu so,
Bi ‘fe Re ti po to;
Titi ao fi fara wa rubo;
Anu ti On fihan,
At’ayo t’O nfun ni;
Je ti awon ti o gbekele.','Ni ‘dapo pelu Re,
Ao joko l’ese Re;
Tabi ki a ma rin pelu Re,
Awa yo gbo Tire,
Ao jise t’Oran wa,
Ma beru, sa gbekele nikan.
Amin.']::text[], chorus_yoruba='Sagbekele,
Ona miran ko si;
Lati l’ayo n’nu Jesu,
Ju pe, ka gbekele.' WHERE hymn_number=20113;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ki nfe O si Kristi,
Ki nfe O si!
Gb’adura ti mo ngba;
L’or’ ekun mi;
Eyi ni ebe mi;
Ki nfe O si Kristi:
Ki nfe O si,
Ki nfe O si.','L’ekan ohun aye,
Ni mo ntoro;
Nisiyi, ‘Wo nikan,
Ni emi nwa;
Eyi l’adura mi:
Ki nfe O si Kristi,
Ki nfe O si,
Ki nfe O si.','Je ki ‘banuje de,
At’irora;
Didun l’o jise Re,
At’ ise won;
‘Gba won mba mi korin:
Ki nfe O si Kristi,
Ki nfe O si,
Ki nfe O si.','Nje, opin emi mi;
Y’o jiyin Re,
Eyi y’o je oro,
Ikehin mi;
Adura mi y’o je:
Ki nfe O si Kristi,
Ki nfe O si,
Ki nfe O si.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20114;
UPDATE public.hymns SET verses_yoruba=ARRAY['Jesu, mo ti se ‘leri,
Lati sin O d’opin;
Ma wa l’odo mi titi,
Baba mi, Ore mi;
Emi k’y’o beru ogun,
B’iwo ba sunmo mi,
Emi ki yo si sina;
B’O ba f’ona han mi.','Je ki nmo p’O sunmo mi;
Tori ‘baje aye;
Aye fe gba okan mi,
Aye fe tan mi je;
Ota yi mi kakiri,
L’ode ati ninu;
Sugbon Jesu sunmo mi,
Dabobo okan mi.','Jeki nma gbo ohun Re,
B’O ti mba mi soro,
Larin iji idanwo,
Aso at’agidi;
So, mu ko da mi loju,
K’okan mi ni ‘janu;
So, si mu mi gbo Tire,
‘Wo Olutoju mi.','Jesu,’wo ti se’leri;
F’awon t’o tele O,
Pe ibikibi t’O wa;
N’iranse Re yo wa;
Jesu, mo ti se ‘leri,
Lati sin O dopin,
Je ki nle to O leyin,
Baba mi, Ore mi.','Jeki nma ri ‘pase Re,
Ki nle ma tele O;
Nipa ‘gbara Re nikan,
Ni mo le tele O:
To mi, pe mi, si fa mi,
Di mi mu de opin;
Si gba mi si odo Re,
Baba mi, Ore mi.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20115;
UPDATE public.hymns SET verses_yoruba=ARRAY['Jesu Oluwa, Oba mi;
Gb’ohun mi nigbati mo npe,
Gb’ohun mi lati ‘bugbe Re;
Ro ‘jo ore-ofe sile,
Oluwa mi, mo feran Re,
Je ki nle ma feran Re si.','Jesu mo ti jafara ju;
Uno se le fe O, b’o ti ye,
Em’ o se le gb’ ogo Re ga;
Ati ewa oruko Re,
Oluwa mi, mo feran Re,
Je ki nle ma feran Re si.','Jesu ki l’o ri ninu mi;
Ti ‘fe na fi po to bayi?
Ore Re si mi ti po to!
O ta gbogbo ero mi yo;
Oluwa mi, mo feran Re,
Je ki nle ma feran Re si.','2. Jesu mo ti jafara ju;
Uno se le fe O, b’o ti ye,
Em’ o se le gb’ ogo Re ga;
Ati ewa oruko Re,
Oluwa mi, mo feran Re,
Je ki nle ma feran Re si.','Jesu ‘Wo o je orin mi,
Tire laya at’okan mi;
Tire ni gbogbo ini mi,
Olugbala, ‘Wo ni temi,
Oluwa mi, mo feran Re;
Je ki nle ma feran Re si.','2. Jesu mo ti jafara ju;
Uno se le fe O, b’o ti ye,
Em’ o se le gb’ ogo Re ga;
Ati ewa oruko Re,
Oluwa mi, mo feran Re,
Je ki nle ma feran Re si.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20116;
UPDATE public.hymns SET verses_yoruba=ARRAY['Ire t’a su ni Eden,
N’igbeyawo ‘kini;
Ibukun t’a bukun won,
O wa sibe-sibe.','Sibe titi di oni,
N’igbeyawo Kristiani;
Olorun wa l’arin wa,
Lati sure fun wa.','Ire ki won le ma bi;
Ki won ko si ma re;
Ki won ni ‘dapo mimo,
T’enikan k’yo le tu.','Ba wa pe, Baba orun,
F’obirin yi f’oko;
Bi O ti fi Efa fun,
Adam l’ojo ‘kini.','Ba wa pe, Immanuel;
Si so owo won po;
B’eda meji ti papo,
L’ara ijinle Re.','Ba wa pe, Emi mimo;
F’ibukun Re fun won;
Si se won ni asepe,
Gege b’O ti ma nse.','Fi won s’abe abo Re,
K’ibi kan ma ba won;
‘Gba won npara ile Re,
Ma toju okan won.','Pelu won loj’ aye won,
At’ oko at’ aya;
Titi won o d’odo Re;
N’ile ayo l’orun.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20117;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. Jesu f''ara han nitoto;
Nibi ase ''yawo,
Oluwa, awa be O, wa,
F''ara Re han nihin.','2. Fi ibukun Re fun awon;
Ti o da ''wopo yi;
F''oju rere wo ''dapo won,
Si bukun egbe won.','3. F''ebun ife kun aya won,
Fun won nl ''telorun;
Fi alafia Re fun won,
Si busi ini won.','4. F''lfe mimo so won d''okan,
Ki won f''ife Kristi,
Mu aniyan ile fere;
Nipa ajumose.','5. Je ki won ran ''ra won lowo,
Ninu igbagbo won;
Ki won si ni omo rere,
Ti y''o gbe ''le won ro.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20118;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. Bukun ni fun ohun,
T''o de wa po n''nu ''fe;
Idapo awon olufe,
Dabi ijo t''orun.','2. Niwaju ''te Baba,
Li awa ngbadura;
Okan n''ireti at''eru,
Ati ni itunu.','3. Awa mb''ara wa pin,
Ninu wahala wa;
Awa si mb''ara wa sokun;
Ninu ''banuje wa.','4. Nigbat'' a ba pinya,
Inu wa a baje;
Sibe okan wa y''o j''okan,
N''ireti ipade.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20119;
UPDATE public.hymns SET verses_yoruba=ARRAY['O ti dara to lati ri;
Awon ara ni irepo,
T’ero at’ oro won j’okan,
Ti won nfi ‘gbagbo at’ ife,
Jumo nwa ohun ti orun,
Won nkede okiki Jesu.','Olorun, Olore-ofe,
T’inu re dun s’ isokan wa,
On f’ ayo busi ‘pade wa;
O nf’ itura mu wa soji;
O ntu ‘bukun Re sori wa,
O nfun wa n’ibale okan.','Jesu, Okuta igun ‘le;
Jek’ awon t’Emi Re dapo,
Ma wa n’nu isokan pipe;
Jek’ a ma gbe ‘nu Emi Re,
K’a f’apere ‘sokan mimo;
Lele fun ijo Re nihin.','Jek’ a ma fa mo ara wa,
F’ebun or’-ofe re fun wa;
Lati ma ya wa si mimo;
Titi ao fi d’eni pipe,
T’ao ba awon t’oke pade;
T’ao si ni ipo lodo Re.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20120;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. ''Gbat'' aye yi ba koja,
Ti orun re ba si wo;
Ti a ba wo ''nu ogo;
T''a boju wo ehin wa,
Gbana, Oluwa, uno mo,
Bi ''gbese mi ti po to.','2. ''Gba mo ba de ''b''ite Re;
L''ewa ti ki se t''emi,
''Gba mo ri O b''O ti ri,
Ti mo fe O l''a fe tan;
''Gbana Oluwa uno mo;
Bi ''gbese mi ti po to.','3. ''Gba mba gbo orin orun,
T''o ndun bi ohun ara,
Bi iro omi pupo;
T''o si ndun b''ohun duru,
''Gbana Oluwa, uno mo;
Bi''gbese mi ti po to.','4. Oluwa jo, je k''a ri;
Ojiji Re l''aye yi,
K''a mo adun ''dariji,
Pelu iranwo Emi;
Ki ntile mo l''aye yi,
Die ninu ''gbese mi.','5. Ore-ofe l''o yan mi,
L''o yo mi ninu ewu,
Jesu l''Olugbala mi,
Emi so mi di mimo;
K''o mi ki nfi han l''aye,
Bi ''gbese mi ti po to.
Amin.']::text[], chorus_yoruba='' WHERE hymn_number=20121;
UPDATE public.hymns SET verses_yoruba=ARRAY['1. Ojo nla kan mbo wa,
Ojo nla kan mbo;
Ojo nla kan mbo wa, nigba ose,
T''awon eniyan mimo at''elese y''o pinya,
Iwo ha setan fun ojo na?','2. Ojo didan kan mbo
Ojo na mbo wa,
Ojo didan ''kan mbo, nigbose,
Sugbon didan re je ti awon t''o fe Oluwa
Iwo ha se tan fun ojo na?','3. Ojo ''banuje mbo,
Ojo na mbo wa,
Ojo ''banuje mbo nigbose
Ti elese y''o gbo pe: lo, Emi ko mo yin ri''
Iwo ha setan fun ojo na?
Amin.']::text[], chorus_yoruba='O ha setan? O ha se tan?
O setan fun ojo idajo?
O ha setan? O ha setan?
Fun Ojo ''dajo.' WHERE hymn_number=20122;

UPDATE public.hymns SET verses_yoruba=ARRAY['E dide, omo igbala,
Eyin t’e fe Oluwa,
Dide, ilu alagbara;
Ki ota to de Sion.','Egbe mimo ti igbani,
Ti won ti nrin ona yi;
W’asia won t’o nfe lele,
Asegun nipa Kristi.','A ti gbe ‘ku mi ni ‘segun,
Lye wa mbe n’nu Kristi;
L’ojo ‘farahan Oluwa;
A o ho iho ayo.','Laipe ao de ‘bi ite Re;
Ao si mo Oba Ogo;
Nibe ao ke, “Kabiyesi”,
Gbogbo wa y’o gba ere.']::text[], chorus_yoruba='F’agbara re korin kikan,
Bi iro omi okun,
Nipa eje Kristi Jesu,
Awa ju asegun lo;
Awa ju asegun lo,
Awa ju asegun lo,
Nipa eje Kristi Jesu,
Awa ju asegun lo.' WHERE hymn_number=20052;  -- egbe-in-verse left as-is, manual split pending
UPDATE public.hymns SET verses_yoruba=ARRAY['Ha! Egbe mi e w’asia;
Bi ti nfe lele!
Ogun Jesu fere de na,
A fere segun.','Wo opo ogun ti mbo wa;
Esu nko won bo;
Awon alagbara nsubu,
A fe damu tan!','Wo asia Jesu ti nfe,
Gbo ohun ipe;
A o segun gbogbo ota;
Ni oruko Re.','Ogun ngbona girigiri,
Iranwo wa mbo;
Balogun wa mbo wa tete,
Egbe, tujuka!
Amin.']::text[], chorus_yoruba='D’odi mu, Emi fere de;
Beni Jesu nwi,
Ran ‘dahun pada s’orun, pe;
“Awa o di mu.”' WHERE hymn_number=20054;  -- egbe-in-verse left as-is, manual split pending
