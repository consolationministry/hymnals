-- 202610280005: add missing English hymns from the physical hymnal.
-- Re-runnable: INSERT ... ON CONFLICT (hymn_number) DO NOTHING.
-- Rows with verified lyrics are inserted. Hymns without verified lyrics are omitted entirely (no comments, no placeholders).
-- Numbers 10128 and up are used for new hymn_number values (existing max is 10127).
BEGIN;

-- 004 Blessed Assurance (lyrics source: HymnWiki (Hymns for the Church, 1911) and churchposting.com)
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10128, 'Blessed Assurance', 'Blessed assurance, Jesus is mine!', ARRAY['Blessed assurance, Jesus is mine!
Oh, what a foretaste of glory divine!
Heir of salvation, purchased of God,
Born of His Spirit, washed in His blood.',
    'Perfect submission, perfect delight,
Visions of rapture now burst on my sight.
Angels descending, bring from above
Echoes of mercy, whispers of love.',
    'Perfect submission, all is at rest,
I in my Saviour am happy and blest,
Watching and waiting, looking above,
Filled with His goodness, lost in His love.']::text[], 'This is my story, this is my song,
Praising my Saviour all the day long;
This is my story, this is my song,
Praising my Saviour all the day long.', 'Fanny J. Crosby (1873)', 'Uploaded Hymn Collection', 4, 'Adoration', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

-- 064 Rock of Ages Cleft for Me (lyrics source: OpenHymnal Project (Congregational Church Music, 1854) and Timeless Truths library)
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10129, 'Rock of Ages Cleft for Me', 'Rock of Ages, cleft for me', ARRAY['Rock of Ages, cleft for me,
Let me hide myself in Thee;
Let the water and the blood,
From Thy wounded side which flowed,
Be of sin the double cure;
Save from wrath and make me pure.',
    'Not the labor of my hands
Can fulfill Thy law''s demands;
Could my zeal no respite know,
Could my tears forever flow,
All for sin could not atone;
Thou must save, and Thou alone.',
    'Nothing in my hand I bring,
Simply to the cross I cling;
Naked, come to Thee for dress;
Helpless look to Thee for grace;
Foul, I to the fountain fly;
Wash me, Savior, or I die.',
    'While I draw this fleeting breath,
When mine eyes shall close in death,
When I soar to worlds unknown,
See Thee on Thy judgment throne;
Rock of Ages, cleft for me,
Let me hide myself in Thee.']::text[], '', 'Augustus M. Toplady (1776)', 'Uploaded Hymn Collection', 64, 'Acceptance and Pardon', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

-- 085 Nearer My God to Thee (lyrics source: HymnWiki (Relief Society Song Book, 1919, no. 39))
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10130, 'Nearer My God to Thee', 'Nearer, my God, to Thee, nearer to Thee!', ARRAY['Nearer, my God, to Thee, nearer to Thee!
E''en tho'' it be a cross that raiseth me,
Still all my song shall be, nearer, my God, to Thee,
Nearer, my God, to Thee, nearer to Thee!',
    'Tho'' like the wanderer, the sun gone down,
Darkness be over me, my rest a stone,
Yet in my dreams I''d be nearer, my God, to Thee,
Nearer, my God, to Thee, nearer to Thee!',
    'There let the way appear, steps unto heav''n;
All that Thou sendest me, in mercy giv''n;
Angels to beckon me nearer, my God, to Thee,
Nearer, my God, to Thee, nearer to Thee!',
    'Or if, on joyful wing cleaving the sky,
Sun, moon, and stars forget, upward I fly,
Still all my song shall be, nearer, my God, to Thee,
Nearer, my God, to Thee, nearer to Thee!']::text[], '', 'Sarah F. Adams (1841)', 'Uploaded Hymn Collection', 85, 'Heaven and Home', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

-- 066 Happy Day That Fixed My Choice (lyrics source: HymnWiki-style texts via Hymnary.org (Our Great Redeemer's Praise; Baptist Hymnal 1991 #439))
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10131, 'Happy Day That Fixed My Choice', 'O happy day, that fixed my choice', ARRAY['O happy day, that fixed my choice on Thee, my Saviour and my God!
Well may this glowing heart rejoice, and tell its raptures all abroad.',
    '''Tis done, the great transaction''s done! I am my Lord''s, and He is mine.
He drew me, and I followed on, charmed to confess the voice divine.',
    'Now rest, my long divided heart; fixed on this blissful centre, rest.
Here have I found a nobler part; here heavenly pleasures fill my breast.',
    'High heaven that heard the solemn vow, that vow renewed shall daily hear,
Till in life''s latest hour I bow, and bless in death a bond so dear.']::text[], 'Happy day, happy day, when Jesus washed my sins away!
He taught me how to watch and pray, and live rejoicing every day;
Happy day, happy day, when Jesus washed my sins away.', 'Philip Doddridge (1755)', 'Uploaded Hymn Collection', 66, 'Acceptance and Pardon', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

-- 067 Christ Jesus Hath the Pow'r (lyrics source: Hymnary.org text page and The Cyber Hymnal #881 (public domain))
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10132, 'Christ Jesus Hath the Pow''r', 'Christ Jesus hath the pow''r', ARRAY['Christ Jesus hath the pow''r, The power to forgive, The pow''r to quicken whom He will, And make the sinner live.
Christ Jesus hath the pow''r, O tell it far and near! O bring to Him your guilty heart, And grace shall banish fear!',
    'Christ Jesus hath the pow''r, The power to renew, The pow''r to cleanse your heart from sin, And make you wholly true.
Christ Jesus hath the pow''r For evermore to keep; O none can pluck you from His hand, Or rob Him of His sheep!',
    'Christ Jesus hath the pow''r, The power to console, The pow''r to carry all your care, On Him your burdens roll.
Christ Jesus hath the pow''r, To wipe the tear away; O place in Him your confidence! O trust Him, and obey!',
    'Christ Jesus hath the pow''r, The power to destroy, The pow''r to bruise your enemy Who would your soul annoy.
Christ Jesus hath the pow''r, When on your dying bed, To give your soul the victory, The pow''r to raise the dead!']::text[], 'Christ Jesus hath the pow''r, The pow''r of God He wields! Christ Jesus hath the pow''r, My heart surrender yields! Christ Jesus hath the pow''r, I trust Him evermore! Christ Jesus hath the pow''r, I worship and adore!', 'James M. Gray (1903)', 'Uploaded Hymn Collection', 67, 'Acceptance and Pardon', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

-- 068 My Soul Is So Happy in Jesus (lyrics source: Hymnary.org (The New Praiseworthy #223; Cyber Hymnal) (public domain))
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10133, 'My Soul Is So Happy in Jesus', 'My soul is so happy in Jesus, For He is so precious to me', ARRAY['My soul is so happy in Jesus, For He is so precious to me; His voice it is music to hear it, His face it is heaven to see.',
    'He sought me so long ere I knew Him, When wand''ring afar from the fold; Safe home in His arms He hath bro''t me, To where there are pleasures untold.',
    'His love and His mercy surround me, His grace like a river doth flow; His Spirit, to guide and to comfort, Is with me wherever I go.',
    'They say I shall some day be like Him, My cross and my burden lay down; Till then I will ever be faithful, In gathering gems for His crown.']::text[], 'I am happy in Him, I am happy in Him; My soul with delight He fills day and night. For I am happy in Him.', 'E. O. Excell (1902)', 'Uploaded Hymn Collection', 68, 'Acceptance and Pardon', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

-- 062 At Calvary (lyrics source: Hymnary.org text page (Our Great Redeemer's Praise #579) (public domain))
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10134, 'At Calvary', 'Years I spent in vanity and pride', ARRAY['Years I spent in vanity and pride, caring not my Lord was crucified, knowing not it was for me He died on Calvary.',
    'By God''s Word at last my sin I learned; then I trembled at the law I''d spurned, till my guilty soul imploring turned to Calvary.',
    'Now I''ve giv''n to Jesus ev''rything; now I gladly own Him as my King; now my raptured soul can only sing of Calvary.',
    'O the love that drew salvation''s plan! O the grace that brought it down to man! O the mighty gulf that God did span at Calvary!']::text[], 'Mercy there was great and grace was free; pardon there was multiplied to me; there my burdened soul found liberty, at Calvary.', 'William R. Newell (1895)', 'Uploaded Hymn Collection', 62, 'Redemption/Gospel Appeal', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

-- Third pass: inserts from hymnary.org / Hymntime / HymnsToGod / Hymnallibrary text.
-- 015 O for a Thousand Tongues to Sing (lyrics source: Hymnary.org UMH #57 text and Project Wittenberg (Lutheran Hymnal 1941) stanzas 1-5 and 7)
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10139, 'O for a Thousand Tongues to Sing', 'O for a thousand tongues to sing my great Redeemer''s praise,', ARRAY['O for a thousand tongues to sing my great Redeemer''s praise, the glories of my God and King, the triumphs of his grace!',
    'My gracious Master and my God, assist me to proclaim, to spread through all the earth abroad the honors of thy name.',
    'Jesus! the name that charms our fears, that bids our sorrows cease; ''tis music in the sinner''s ears, ''tis life, and health, and peace.',
    'He breaks the power of canceled sin, he sets the prisoner free; his blood can make the foulest clean; his blood availed for me.',
    'He speaks, and listening to his voice, new life the dead receive; the mournful, broken hearts rejoice, the humble poor believe.',
    'Hear him, ye deaf; his praise, ye dumb, your loosened tongues employ; ye blind, behold your Savior come, and leap, ye lame, for joy.',
    'In Christ, your head, you then shall know, shall feel your sins forgiven; anticipate your heaven below, and own that love is heaven.']::text[], '', 'Charles Wesley (1739)', 'Uploaded Hymn Collection', 15, 'Christian Life', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

-- 016 O Worship the King (lyrics source: Hymnary.org Trinity Hymnal #2 text (Robert Grant, 1833))
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10140, 'O Worship the King', 'O worship the King all-glorious above,', ARRAY['O worship the King all-glorious above, O gratefully sing his pow''r and his love; our shield and Defender, the Ancient of Days, pavilioned in splendor and girded with praise.',
    'O tell of his might, O sing of his grace, whose robe is the light, whose canopy space. His chariots of wrath the deep thunderclouds form, and dark is his path on the wings of the storm.',
    'The earth with its store of wonders untold, Almighty, your pow''r has founded of old; has ''stablished it fast by a changeless decree, and round it has cast, like a mantle, the sea.',
    'Your bountiful care what tongue can recite? It breathes in the air; it shines in the light; it streams from the hills; it descends to the plain; and sweetly distils in the dew and the rain.',
    'Frail children of dust, and feeble as frail, in you do we trust, nor find you to fail; your mercies how tender, how firm to the end, our Maker, Defender, Redeemer, and Friend!',
    'O measureless Might! Ineffable Love! While angels delight to hymn you above, the humbler creation, though feeble their lays, with true adoration shall lisp to your praise.']::text[], '', 'Robert Grant (1833)', 'Uploaded Hymn Collection', 16, 'Adoration', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

-- 017 Praise Him! Praise Him! (lyrics source: Hymnary.org Trinity Hymnal #683 text and nethymnal (Crosby, 1869))
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10141, 'Praise Him! Praise Him!', 'Praise Him! praise Him! Jesus, our blessed Redeemer!', ARRAY['Praise Him! praise Him! Jesus, our blessed Redeemer! Sing, O earth, His wonderful love proclaim! Hail Him! hail Him! highest archangels in glory; Strength and honor give to His holy Name! Like a shepherd, Jesus will guard His children, In His arms He carries them all day long.',
    'Praise Him! praise Him! Jesus, our blessed Redeemer! For our sins He suffered, and bled, and died; He our Rock, our hope of eternal salvation, Hail Him! hail Him! Jesus the Crucified. Sound His praises! Jesus who bore our sorrows, Love unbounded, wonderful, deep and strong.',
    'Praise Him! praise Him! Jesus, our blessed Redeemer! Heav''nly portals loud with hosannas ring! Jesus, Saviour, reigneth for ever and ever; Crown Him! crown Him! Prophet, and Priest, and King! Christ is coming! Over the world victorious, Pow''r and glory unto the Lord belong.']::text[], 'Praise Him! praise Him! Tell of His excellent greatness. Praise Him! praise Him! ever in joyful song!', 'Fanny J. Crosby (1869)', 'Uploaded Hymn Collection', 17, 'Adoration', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

-- 059 Come Believing (lyrics source: Hymntime.com (Gospel Hymns No. 4 text) and Song2Slides, verified against Cyber Hymnal #938 via Hymnary.org (Whittle))
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10155, 'Come Believing', 'Once again the Gospel message from the Saviour you have heard;', ARRAY['Once again the Gospel message From the Saviour you have heard; Will you heed the invitation? Will you turn and seek the Lord?',
    'Many summers you have wasted, Ripened harvests you have seen; Winter snows by spring have melted, Yet you linger in your sin.',
    'Jesus for your choice is waiting; Tarry not: at once decide! While the Spirit now is striving, Yield, and seek the Saviour''s side.',
    'Cease of fitness to be thinking; Do not longer try to feel; It is trusting, and not feeling, That will give the Spirit''s seal.',
    'Let your will to God be given, Trust in Christ''s atoning blood; Look to Jesus now in heaven, Rest on His unchanging word.']::text[], 'Come believing! come believing! Come to Jesus! look and live! Come believing! come believing! Come to Jesus! look and live!', 'Daniel W. Whittle (1881)', 'Uploaded Hymn Collection', 59, 'Redemption/Gospel Appeal', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

-- 092 Deeper, Deeper in the Love of Jesus (lyrics source: Hymnary.org (Our Great Redeemer's Praise #328) and Hymnallibrary.org text)
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10165, 'Deeper, Deeper in the Love of Jesus', 'Deeper, deeper in the love of Jesus daily let me go;', ARRAY['Deeper, deeper in the love of Jesus daily let me go; higher, higher in the school of wisdom, more of grace to know.',
    'Deeper, deeper! Blessed Holy Spirit, take me deeper still, till my life is wholly lost in Jesus, and His perfect will.',
    'Deeper, deeper! Though it cost hard trials, deeper let me go! Rooted in the holy love of Jesus, let me fruitful grow.',
    'Deeper, higher, ev''ry day in Jesus, till all conflict past finds me conqu''ror, and in His own image perfected at last.']::text[], 'O deeper yet, I pray, and higher ev''ry day, and wiser, blessed Lord, in Thy precious, holy Word.', 'Charles Price Jones (1900)', 'Uploaded Hymn Collection', 92, 'Christian Life', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

-- 136 Safe in the Arms of Jesus (lyrics source: Hymnary.org and Hymnallibrary.org text (Crosby, 1868))
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10178, 'Safe in the Arms of Jesus', 'Safe in the arms of Jesus, safe on His gentle breast,', ARRAY['Safe in the arms of Jesus, safe on His gentle breast, there by His love o''ershaded, sweetly my soul shall rest. Hark! ''tis the voice of angels, borne in a song to me, over the fields of glory, over the jasper sea.',
    'Safe in the arms of Jesus, safe from corroding care, safe from the world''s temptations, sin cannot harm me there. Free from the blight of sorrow, free from my doubts and fears; only a few more trials, only a few more tears!',
    'Jesus, my heart''s dear refuge, Jesus has died for me; firm on the Rock of Ages, ever my trust shall be. Here let me wait in patience, wait till the night is o''er; wait till I see the morning break on the golden shore.']::text[], 'Safe in the arms of Jesus, safe on His gentle breast, there by His love o''ershaded, sweetly my soul shall rest.', 'Fanny J. Crosby (1868)', 'Uploaded Hymn Collection', 136, 'Christian Life', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

-- 140 Standing on the Promises (lyrics source: Hymnary.org (Our Great Redeemer's Praise #434) and Cyber Hymnal #6316 (Carter, 1886))
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10179, 'Standing on the Promises', 'Standing on the promises of Christ my King!', ARRAY['Standing on the promises of Christ my King! Through eternal ages let His praises ring. "Glory in the highest!" I will shout and sing, standing on the promises of God.',
    'Standing on the promises that cannot fail! When the howling storms of doubt and fear assail, by the living Word of God I shall prevail, standing on the promises of God.',
    'Standing on the promises I now can see perfect, present cleansing in the blood for me; standing in the liberty where Christ makes free, standing on the promises of God.',
    'Standing on the promises of Christ the Lord, bound to Him eternally by love''s strong cord, overcoming daily with the Spirit''s sword, standing on the promises of God.',
    'Standing on the promises I cannot fall, listening every moment to the Spirit''s call, resting in my Savior as my all in all, standing on the promises of God.']::text[], 'Standing, standing, standing on the promises of God, my Savior; standing, standing, I''m standing on the promises of God.', 'Russell Kelso Carter (1886)', 'Uploaded Hymn Collection', 140, 'Christian Life', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

-- 149 I Need Thee Every Hour (lyrics source: Hymnary.org (Our Great Redeemer's Praise #340) and Hymnallibrary.org text (Hawks, 1872))
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10186, 'I Need Thee Every Hour', 'I need Thee every hour, most gracious Lord;', ARRAY['I need Thee ev''ry hour, most gracious Lord; no tender voice like Thine can peace afford.',
    'I need Thee ev''ry hour, stay Thou nearby; temptations lose their pow''r when Thou art nigh.',
    'I need Thee ev''ry hour, in joy or pain; come quickly and abide, or life is vain.',
    'I need Thee ev''ry hour, teach me Thy will; and Thy rich promises in me fulfill.',
    'I need Thee ev''ry hour, most Holy One; O make me Thine indeed, Thou blessed Son.']::text[], 'I need Thee, O I need Thee; ev''ry hour I need Thee; O bless me now, my Savior, I come to Thee.', 'Annie S. Hawks (1872)', 'Uploaded Hymn Collection', 149, 'Prayer', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

-- 151 I Must Tell Jesus (lyrics source: HymnsToGod.org and SDAH 485 text (Hoffman, 1894))
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10187, 'I Must Tell Jesus', 'I must tell Jesus all of my trials;', ARRAY['I must tell Jesus all of my trials; I cannot bear these burdens alone; In my distress He kindly will help me; He ever loves and cares for His own.',
    'I must tell Jesus all of my troubles; He is a kind, compassionate friend; If I but ask Him, He will deliver, Make of my troubles quickly an end.',
    'Tempted and tried, I need a great Savior, One who can help my burdens to bear; I must tell Jesus, I must tell Jesus; He all my cares and sorrows will share.',
    'O how the world to evil allures me! O how my heart is tempted to sin! I must tell Jesus, and He will help me Over the world the vict''ry to win.']::text[], 'I must tell Jesus! I must tell Jesus! I cannot bear my burdens alone; I must tell Jesus! I must tell Jesus! Jesus can help me, Jesus alone.', 'Elisha A. Hoffman (1894)', 'Uploaded Hymn Collection', 151, 'Prayer', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

-- 240 In the Sweet By and By (lyrics source: Hymnary.org Cyber Hymnal #3020 text (Bennett, 1868))
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10225, 'In the Sweet By and By', 'There''s a land that is fairer than day,', ARRAY['There''s a land that is fairer than day, And by faith we can see it afar; For the Father waits over the way To prepare us a dwelling place there.',
    'We shall sing on that beautiful shore The melodious songs of the blessed; And our spirits shall sorrow no more, Not a sigh for the blessing of rest.',
    'To our bountiful Father above, We will offer our tribute of praise For the glorious gift of His love And the blessings that hallow our days.']::text[], 'In the sweet by and by, We shall meet on that beautiful shore; In the sweet by and by, We shall meet on that beautiful shore.', 'Sanford Fillmore Bennett (1868)', 'Uploaded Hymn Collection', 240, 'Heaven and Home', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;



















-- 093 O to Be Like Thee (lyrics source: Our Great Redeemer's Praise #315)
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10166, 'O to Be Like Thee', 'O to be like Thee! Blessed Redeemer', ARRAY['O to be like Thee! Blessed Redeemer, this is my constant longing and prayer; gladly I''ll forfeit all of earth''s treasures, Jesus Thy perfect likeness to wear.',
    'O to be like Thee! Full of compassion, loving, forgiving, tender, and kind; helping the helpless, cheering the fainting, seeking the wand''ring sinner to find.',
    'O to be like Thee! Lowly in spirit, holy and harmless, patient, and brave; meekly enduring cruel reproaches, willing to suffer, others to save.',
    'O to be like Thee! Lord, I am coming now to receive th''anointing divine; all that I am and have I am bringing, Lord, from this moment all shall be Thine.',
    'O to be like Thee! While I am pleading, pour out Thy Spirit, fill with Thy love; make me a temple meet for Thy dwelling, fit me for life and heaven above.']::text[], 'Oh! to be like Thee! O to be like Thee,
Blessed Redeemer, pure as Thou art;
Come in Thy sweetness, come in Thy fullness;
Stamp Thine own image deep on my heart.', 'Thomas O. Chisholm', 'Uploaded Hymn Collection', 93, 'Christian Life', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

-- 097 Once More My Soul Thy Saviour (lyrics source: Alexander's Gospel Songs No. 2 #26 (I Will))
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10169, 'Once More My Soul Thy Saviour', 'Once more, my soul, thy Saviour, through the Word', ARRAY['Once more, my soul, thy Saviour, through the Word, Is offered full and free; And now, O Lord, I must, I must decide: Shall I accept of Thee?',
    'By grace I will Thy mercy now receive, Thy love my heart hath won: On Thee, O Christ, I will, I will believe, And trust in Thee alone!',
    'Thou knowest, Lord, how very weak I am, And how I fear to stray; For strength to serve I look to Thee alone, The strength Thou must supply.',
    'And now, O Lord, give all with us to-day The grace to join our song; And from the heart to gladly with us say: "I WILL to Christ belong!"',
    'To all who came, when Thou wast here below And said, "O Lord, wilt Thou?" To them, "I will!" was ever Thy reply: We rest upon it now.']::text[], 'I will! I will! I will!
God helping me, I will, O Lord, be Thine!
Thy precious blood was shed to purchase me,
I will be wholly Thine!', 'Daniel Webster Whittle', 'Uploaded Hymn Collection', 97, 'Christian Life', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

















-- 250 Dreamed That the Great Judgment Morning (lyrics source: Timeless Truths #377, library.timelesstruths.org; text as printed there)
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10234, 'Dreamed That the Great Judgment Morning', 'I dreamed that the great judgment morning', ARRAY['I dreamed that the great judgment morning Had dawned, and the trumpet had blown; I dreamed that the nations had gathered To judgment before the white throne; And then came a bright, shining angel, Who stood on the land and the sea, And swore with his hand raised to Heaven That time was no longer to be.',
    'The rich man was there, but his money Had melted and vanished away; A pauper he stood in the judgment, His debts were too heavy to pay; The great man was there, but his greatness, When death came, was left far behind! The angel that opened the records, No trace of his greatness could find.',
    'The widow was there with the orphans, God heard and remembered their cries; No sorrow in heaven forever, God wiped all the tears from their eyes; The gambler was there, and the drunkard, And they who had sold them the drink, And those that had granted the license— Together in hell they did sink.',
    'The moral man came to the judgment, But self-righteous rags would not do; The men who had crucified Jesus Had passed off as moral men, too; The soul that had put off salvation— ''Not yet; I''ll get saved by and by, No time now to think of religion!'' At last they had found time to die.']::text[], 'And, oh, what a weeping and wailing,
As the lost were told of their fate;
They cried for the rocks and the mountains,
They prayed, but their prayer was too late.', 'Bertram H. Shadduck (1894)', 'Uploaded Hymn Collection', 250, 'Warning and Judgment', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;


-- 172 Jesus Reigns (lyrics source: hymntime.com/tch Jesus Reigns, from Irvin H. Mack, The Service of Praise (1900) #178)
INSERT INTO public.hymns (hymn_number, title_en, first_line_en, verses_en, chorus_en, author_en, source_hymnal, source_hymn_number, category, status, copyright_status)
VALUES (10192, 'Jesus Reigns', 'Sing aloud, ye Christian lands', ARRAY['Sing aloud, ye Christian lands, Songs of greatest triumph, For your Lord has burst the bands— Lives no more to die. O sad the night the Lord lay dead; All earth was steeped in sorrow; But hail! He triumphed, as He said, And rose to reign on high.',
    'Hallelujah! Praise the Lord! Raise the mighty anthem; Death is vanquished by His Word, Christ has made us free. The stone and seal, the guard at night, Their watch in silence keeping, Were all in vain, for in His might The Saviour rose again.',
    'Praise the Lord! Exultant King! List! Angelic voices, As to earth the news they bring— Immortality! From out the tomb, in majesty, He came in radiant beauty, And rose with heavenly hosts to be The King eternally.']::text[], 'Sing we loud the chorus, Sending praise before us; Jesus reigns o''er us; King of kings is He. O sad the night the Lord lay dead; All earth was steeped in sorrow; But hail! He triumphed, as He said, And rose to reign on high.', 'Lincoln Hall (1866-1930) / Irvin H. Mack', 'Uploaded Hymn Collection', 172, 'Easter', 'published', 'Public domain text')
ON CONFLICT (hymn_number) DO NOTHING;

COMMIT;
